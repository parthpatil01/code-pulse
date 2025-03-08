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
    command: (code, filePath) => {
      const filePathWithExtension = `${filePath}.js`;
      fs.writeFileSync(filePathWithExtension, code);
      return {
        command: `node "${filePathWithExtension}"`,
        filesToCleanup: [filePathWithExtension],
        extension: '.js'
      };
    },
  },
  python: {
    command: (code, filePath) => {
      const filePathWithExtension = `${filePath}.py`;
      fs.writeFileSync(filePathWithExtension, code);
      return {
        command: `python "${filePathWithExtension}"`,
        filesToCleanup: [filePathWithExtension],
        extension: '.py'
      };
    },
  },
  java: {
    command: (code, filePath) => {
      // Extract class name
      const classNameMatch = /class\s+(\w+)/.exec(code);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      
      const directory = path.dirname(filePath);
      const filePathWithExtension = path.join(directory, `${className}.java`);
      const classFilePath = path.join(directory, `${className}.class`);
      
      fs.writeFileSync(filePathWithExtension, code);
      
      return {
        command: `javac "${filePathWithExtension}" && java -cp "${directory}" ${className}`,
        filesToCleanup: [filePathWithExtension, classFilePath],
        extension: '.java',
        className: className
      };
    },
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

// Process a single message
async function processMessage(message) {
  console.log('Processing message:', message);

  let filesToCleanup = [];

  try {
    const body = JSON.parse(message.Body);
    const { submissionId, language, s3Key } = body;

    console.log(`Processing submission ${submissionId} in ${language}`);

    // Fetch code from S3
    const s3Response = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    }).promise();

    const code = s3Response.Body.toString('utf-8');

    // Prepare for execution
    const tempFilePath = path.join(os.tmpdir(), `temp_${submissionId}`);
    console.log(`Temp file path: ${tempFilePath}`);

    // Get the language-specific command and files to cleanup
    const result = languageConfigs[language].command(code, tempFilePath);
    const execCommand = result.command;
    filesToCleanup = result.filesToCleanup || [];
    const fileExtension = result.extension;
    const className = result.className; // Only used for Java

    console.log(`Executing command: ${execCommand}`);

    // Connect to database
    const db = await connectToDatabase();

    // Update status to running
    await db.execute(
      'UPDATE submissions SET status = ? WHERE id = ?',
      ['running', submissionId]
    );

    // Execute the code in Docker container for security
    let dockerCommand;
    
    if (language === 'java') {
      // Special handling for Java
      const javaFileName = `${className}.java`;
      const tempDir = path.dirname(tempFilePath);
      const javaFilePath = path.join(tempDir, javaFileName);
      
      dockerCommand = `docker run --rm --network none --memory=100m --cpus=0.5 --pids-limit=50 ` +
        `-v "${javaFilePath}:/code/${javaFileName}" ` +
        `code-executor-image sh -c "cd /code && javac ${javaFileName} && java ${className}"`;
    } else {
      // For JavaScript and Python
      const tempFilePathWithExt = `${tempFilePath}${fileExtension}`;
      const containerFileName = path.basename(tempFilePath) + fileExtension;
      const containerFilePath = `/code/${containerFileName}`;
      
      const execPrefix = language === 'javascript' ? 'node' : 
                         language === 'python' ? 'python' : '';
      
      dockerCommand = `docker run --rm --network none --memory=100m --cpus=0.5 --pids-limit=50 ` +
        `-v "${tempFilePathWithExt}:${containerFilePath}" ` +
        `code-executor-image sh -c "${execPrefix} ${containerFilePath}"`;
    }
    
    console.log(`Docker command: ${dockerCommand}`);
    const { stdout, stderr } = await execPromise(dockerCommand);

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
    await db.execute(
      'UPDATE submissions SET status = ?, output_path = ?, completed_at = NOW() WHERE id = ?',
      [stderr ? 'error' : 'completed', outputKey, submissionId]
    );

    // Delete the message from the queue
    await sqs.deleteMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle
    }).promise();

  } catch (error) {
    console.error('Error processing message:', error);

    try {
      // Connect to database
      const db = await connectToDatabase();

      // Update status to error
      const submissionId = JSON.parse(message.Body).submissionId;
      await db.execute(
        'UPDATE submissions SET status = ?, error_message = ?, completed_at = NOW() WHERE id = ?',
        ['error', error.message, submissionId]
      );
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
    console.log(process.env.SQS_QUEUE_URL)
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