const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config();

// Check for required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility: get embedding for the input code
const getEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

// Utility: get relevant docs from Pinecone
const getRelevantDocs = async (embedding) => {
  try {
    const index = pinecone.index(process.env.PINECONE_INDEX);
    const queryResult = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    return queryResult.matches.map((match) => match.metadata.text).join('\n---\n');
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error('Failed to retrieve relevant documentation');
  }
};

// Validate user input
const validateUserCode = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code input: must be a non-empty string');
  }
  if (code.length > 10000) {
    throw new Error('Code input exceeds maximum allowed length');
  }
  return code;
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  try {
    // Handle preflight CORS requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight response' }),
      };
    }

    // Parse and validate request
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    try {
      const userCode = validateUserCode(body.code);

      // Generate embedding for the code
      const codeEmbedding = await getEmbedding(userCode);

      // Get relevant documentation
      const relevantDocs = await getRelevantDocs(codeEmbedding);

      // Create prompt for refactoring
      const prompt = `
        You are an expert software engineer.
        Given the user code below, and some reference documentation, suggest refactored code with improvements.

        Reference Docs:
        ${relevantDocs}

        User Code:
        ${userCode}

        Refactored Code:
      `;

      // Get refactoring suggestion from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const refactoredCode = completion.choices[0].message.content;

      // Return the result
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          originalCode: userCode,
          refactoredCode,
        }),
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: error.message }),
      };
    }
  } catch (err) {
    console.error('Unhandled error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'See server logs for details',
      }),
    };
  }
};
