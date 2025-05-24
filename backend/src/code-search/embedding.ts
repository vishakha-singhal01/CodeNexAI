import { generateAIDocumentation } from '../services/documentation/geminiService';

export async function generateEmbedding(text: string): Promise<number[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not defined in .env file.');
    }
  const summary = await generateAIDocumentation(text);
  // Replace with actual OpenAI embedding generation logic
  // This is a placeholder
  const embedding = Array(1536).fill(Math.random());
  return embedding;
}
