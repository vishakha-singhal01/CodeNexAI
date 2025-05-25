import { generateEmbedding } from './embedding';
import * as fs from 'fs';
import * as path from 'path';

// In-memory vector store (replace with Qdrant or Pinecone for production)
const vectorStore: { [key: string]: number[] } = {};

const vectorStorePath = path.join(__dirname, 'vector-store.json');

// Load vector store from file on startup
try {
  const data = fs.readFileSync(vectorStorePath, 'utf-8');
  const parsedVectorStore = JSON.parse(data);
  Object.assign(vectorStore, parsedVectorStore);
  console.log("Vector store loaded from file:", Object.keys(vectorStore).length, "entries");
} catch (error) {
  console.log("No vector store file found, starting with empty store.");
}

console.log("Vector store size:", Object.keys(vectorStore).length);

export async function storeEmbedding(id: string, embedding: number[]) {
  vectorStore[id] = embedding;
  // Save vector store to file after every update
  fs.writeFileSync(vectorStorePath, JSON.stringify(vectorStore));
}

export async function searchCode(processedQuery: string, topN: number = 5): Promise<string[]> {
  // Generate embedding for the processed query
  try {
    const queryEmbedding = await generateEmbedding(processedQuery);

    // Calculate cosine similarity between query embedding and all code chunk embeddings
    const similarities = Object.entries(vectorStore).map(([id, embedding]) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { id, similarity };
    });

    // Sort by similarity in descending order
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Get the top N most similar code chunk IDs
    const topIds = similarities.slice(0, topN).map(item => item.id);

    return topIds;
  } catch (error: unknown) {
    console.error("Error generating embedding:", error);
    return []; // Return empty array in case of error
  }
}

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA && magnitudeB) {
    return dotProduct / (magnitudeA * magnitudeB);
  } else {
    return 0;
  }
  return 0;
}
