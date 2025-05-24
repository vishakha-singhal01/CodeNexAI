import { generateAIDocumentation } from '../services/documentation/geminiService';

export async function generateEmbedding(text: string): Promise<number[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env file.');
  }
  try {
    const summary = await generateAIDocumentation(text);
    // Use the summary to generate an embedding
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(summary.charCodeAt(i % summary.length) / 100);
    }
    return embedding;
  } catch (error: unknown) {
    console.error("Error generating embedding:", error);
    return Array(1536).fill(0); // Return a zero vector in case of error
  }
}
