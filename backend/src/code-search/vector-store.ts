import { processNaturalLanguageQuery } from './nlp';
import { generateEmbedding } from './embedding';

// In-memory vector store (replace with Qdrant or Pinecone for production)
const vectorStore: { [key: string]: number[] } = {};

export async function storeEmbedding(id: string, embedding: number[]) {
  vectorStore[id] = embedding;
}

export async function searchCode(query: string, topN: number = 5): Promise<string[]> {
  // Process the query using NLP techniques
  const processedQuery = processNaturalLanguageQuery(query);

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
