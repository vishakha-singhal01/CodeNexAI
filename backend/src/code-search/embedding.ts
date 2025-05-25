import { generateAIDocumentation } from '../services/documentation/geminiService';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const prompt = `Return the embedding for the following text: ${text}. Return a JSON array of 1536 numbers.`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const embeddingString = response.text();
    console.log("embeddingString:", embeddingString);
    const embedding = JSON.parse(embeddingString) as number[];
    return embedding;
  } catch (error: unknown) {
    console.error("Error generating embedding:", error);
    return Array(1536).fill(0); // Return a zero vector in case of error
  }
}
