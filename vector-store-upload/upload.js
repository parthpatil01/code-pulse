import fs from 'fs';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import 'dotenv/config';

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX);

// Split text into smaller chunks for uploading
const CHUNK_SIZE = 512;

const splitText = (text) =>
  text.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [];

async function uploadDocs() {
  const files = fs.readdirSync('./docs'); // Directory where your docs are stored

  for (const file of files) {
    const content = fs.readFileSync(path.join('./docs', file), 'utf-8');
    const chunks = splitText(content);

    for (let i = 0; i < chunks.length; i++) {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i],
      });

      const vector = embeddingRes.data[0].embedding;

      await index.upsert([
        {
          id: `${file}-${i}`,
          values: vector,
          metadata: { text: chunks[i], source: file },
        },
      ]);
    }
  }

  console.log('Uploaded all docs to Pinecone.');
}

uploadDocs();