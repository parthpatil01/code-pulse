// ec2-setup/worker.js
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
require('dotenv').config();

// Promisify exec
const execPromise = util.promisify(exec);

// Initialize AWS services
const sqs = new AWS.SQS({
  region: process.env.AWS_REGION || 'us-east-1'
});
const s3 = new AWS.S3();

// Database connection
let connection;

// Language configurations
const languageConfigs = {
  javascript: {
    extension: '.js',
    execPrefix: 'node',
    prepare: (code, filePath) => {
      return { className: null };
    }
  },
  python: {
    extension: '.py',
    execPrefix: 'python3',
    prepare: (code, filePath) => {
      return { className: null };
    }
  },
  java: {
    extension: '.java',
    execPrefix: null, // Special handling for Java
    prepare: (code, filePath) => {
      // Extract class name
      const classNameMatch = /class\s+(\w+)/.exec(code);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      return { className };
    }
  },
};

// Connect to MySQL database
async function connectToDatabase() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  }
  return connection;
}

// Update submission status in database
async function updateSubmissionStatus(submissionId, status, outputPath = null, errorMessage = null) {
  const db = await connectToDatabase();
  
  const updateFields = ['status'];
  const updateValues = [status];
  
  if (status === 'running') {
    // Only update status for running
    await db.execute(
      'UPDATE submissions SET status = ? WHERE id = ?',
      [status, submissionId]
    );
  } else {
    // For completed or error, update more fields
    await db.execute(
      'UPDATE submissions SET status = ?, output_path = ?, error_message = ?, completed_at = NOW() WHERE id = ?',
      [status, outputPath, errorMessage, submissionId]
    );
  }
}

// Execute code in Docker container
async function executeInDocker(language, filePath, className = null) {
  const config = languageConfigs[language];
  const filePathWithExt = `${filePath}${config.extension}`;
  let dockerCommand;
  
  if (language === 'java') {
    // Special handling for Java
    const javaFileName = `${className}.java`;
    const tempDir = path.dirname(filePath);
    const javaFilePath = path.join(tempDir, javaFileName);
    
    dockerCommand = `docker run --rm --network none --memory=100m --cpus=0.5 --pids-limit=50 ` +
      `-v "${javaFilePath}:/code/${javaFileName}" ` +
      `code-executor-image sh -c "cd /code && javac ${javaFileName} && java ${className}"`;
  } else {
    // For JavaScript and Python
    const containerFileName = path.basename(filePath) + config.extension;
    const containerFilePath = `/code/${containerFileName}`;
    
    dockerCommand = `docker run --rm --network none --memory=100m --cpus=0.5 --pids-limit=50 ` +
      `-v "${filePathWithExt}:${containerFilePath}" ` +
      `code-executor-image sh -c "${config.execPrefix} ${containerFilePath}"`;
  }
  
  console.log(`Docker command: ${dockerCommand}`);
  return await execPromise(dockerCommand);
}

// Remove message from SQS queue
async function removeFromQueue(receiptHandle) {
  try {
    await sqs.deleteMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle
    }).promise();
    console.log('Message deleted from queue');
  } catch (error) {
    console.error('Error deleting message from queue:', error);
  }
}

// Process a single message
async function processMessage(message) {
  console.log('Processing message:', message);
  let filesToCleanup = [];
  let submissionId;

  try {
    const body = JSON.parse(message.Body);
    submissionId = body.submissionId;
    const { language, s3Key } = body;

    console.log(`Processing submission ${submissionId} in ${language}`);

    // Fetch code from S3
    const s3Response = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    }).promise();

    const code = s3Response.Body.toString('utf-8');

    // Prepare temp file path
    const tempFilePath = path.join(os.tmpdir(), `temp_${submissionId}`);
    console.log(`Temp file path: ${tempFilePath}`);

    // Get the language configuration
    const config = languageConfigs[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Prepare code and get necessary information
    const { className } = config.prepare(code, tempFilePath);
    
    // Write code to file
    const filePathWithExt = `${tempFilePath}${config.extension}`;
    
    if (language === 'java' && className) {
      // For Java, write to a file named after the class
      const tempDir = path.dirname(tempFilePath);
      const javaFilePath = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(javaFilePath, code);
      filesToCleanup.push(javaFilePath, path.join(tempDir, `${className}.class`));
    } else {
      // For other languages
      fs.writeFileSync(filePathWithExt, code);
      filesToCleanup.push(filePathWithExt);
    }

    // Update status to running
    await updateSubmissionStatus(submissionId, 'running');

    // Execute code in Docker
    const { stdout, stderr } = await executeInDocker(language, tempFilePath, className);

    console.log('Execution completed');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    // Store result in S3
    const outputKey = `outputs/${submissionId}.txt`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: outputKey,
      Body: stdout || stderr,
      ContentType: 'text/plain'
    }).promise();

    // Update database with results
    await updateSubmissionStatus(
      submissionId, 
      stderr ? 'error' : 'completed', 
      outputKey,
      stderr || null
    );

    // Delete the message from the queue regardless of execution success or failure
    await removeFromQueue(message.ReceiptHandle);

  } catch (error) {
    console.error('Error processing message:', error);

    try {
      // Update status to error if we have a submissionId
      if (submissionId) {
        await updateSubmissionStatus(submissionId, 'error', null, error.message);
      }
      
      // Always remove the message from the queue even if processing failed
      await removeFromQueue(message.ReceiptHandle);
      
    } catch (dbError) {
      console.error('Error updating database:', dbError);
    }
  } finally {
    // Clean up temporary files
    filesToCleanup.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`File deleted: ${file}`);
        }
      } catch (cleanupErr) {
        console.error(`Error deleting file ${file}:`, cleanupErr);
      }
    });
  }
}

// Main polling function
async function pollMessages() {
  try {
    console.log('Polling for messages...');
    console.log(process.env.SQS_QUEUE_URL);
    const response = await sqs.receiveMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 20
    }).promise();
    
    if (response.Messages && response.Messages.length > 0) {
      console.log(`Received ${response.Messages.length} messages`);
      
      // Process each message
      await Promise.all(response.Messages.map(processMessage));
    } else {
      console.log('No messages received');
    }
  } catch (error) {
    console.error('Error polling messages:', error);
  }
  
  // Continue polling
  setTimeout(pollMessages, 1000);
}

// Start polling
console.log('Worker starting...');
pollMessages();