
// backend/check-status/index.js
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

// Initialize AWS services
const s3 = new AWS.S3();

// Database connection
let connection;

exports.handler = async (event) => {
  try {
    // Get submission ID from path parameters
    const submissionId = event.pathParameters.submissionId;
    
    if (!submissionId) {
      return formatResponse(400, { error: "Missing submission ID" });
    }
    
    // Create a database connection if it doesn't exist
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
    }
    
    // Query the database for submission status
    const [rows] = await connection.execute(
      'SELECT id, language, status, output_path, error_message, created_at, completed_at FROM submissions WHERE id = ?',
      [submissionId]
    );
    
    if (rows.length === 0) {
      return formatResponse(404, { error: "Submission not found" });
    }
    
    const submission = rows[0];
    
    // If submission is completed or has error, fetch the output from S3
    let output = null;
    if (submission.status === 'completed' || submission.status === 'error') {
      if (submission.output_path) {
        try {
          const s3Response = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: submission.output_path
          }).promise();
          
          output = s3Response.Body.toString('utf-8');
        } catch (s3Error) {
          console.error('Error fetching output from S3:', s3Error);
          // Continue with null output if S3 fetch fails
        }
      }
      
      if (!output && submission.error_message) {
        output = submission.error_message;
      }
    }
    
    // Return the status and output if available
    return formatResponse(200, {
      submissionId: submission.id,
      status: submission.status,
      language: submission.language,
      createdAt: submission.created_at,
      completedAt: submission.completed_at,
      output: output
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { error: "Server error: " + error.message });
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
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}