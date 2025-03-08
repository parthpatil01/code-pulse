// backend/submit-code/index.js
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const sqs = new AWS.SQS();
const s3 = new AWS.S3();

// Database connection
let connection;

exports.handler = async (event) => {
  try {
    // Parse the incoming request
    const body = JSON.parse(event.body);
    const { code, language } = body;
    
    if (!code || !language || !['javascript', 'python', 'java'].includes(language)) {
      return formatResponse(400, { output: "Invalid input or unsupported language" });
    }
    
    // Generate a unique submission ID
    const submissionId = uuidv4();
    
    // Store the code in S3
    const s3Key = `submissions/${submissionId}.${language}`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: code,
      ContentType: 'text/plain'
    }).promise();
    
    // Create a database connection if it doesn't exist
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
    }
    
    // Store submission in the database
    await connection.execute(
      'INSERT INTO submissions (id, language, code_path, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [submissionId, language, s3Key, 'pending']
    );
    
    // Send a message to SQS for code execution
    await sqs.sendMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        submissionId,
        language,
        s3Key
      })
    }).promise();
    
    // Return a response with the submission ID
    return formatResponse(200, { 
      submissionId,
      message: "Code submitted successfully and queued for execution"
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { output: "Server error: " + error.message });
  }
};

// Helper function to format responses
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST'
    },
    body: JSON.stringify(body)
  };
}