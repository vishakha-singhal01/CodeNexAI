import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { CodeDocumentation } from "./types"; // Import the interface

dotenv.config(); // Load environment variables

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Or another suitable model

/**
 * Generates documentation for a given set of code structures using Gemini.
 * @param structures An array of extracted code structure information.
 * @returns A promise that resolves to the generated documentation string (Markdown).
 */
export async function generateAIDocumentation(structures: CodeDocumentation[]): Promise<string> {
  if (structures.length === 0) {
    return "No documentable structures (functions, classes, methods) found to send to AI.";
  }

  // Create a more detailed prompt for Gemini
  const prompt = `
    Generate comprehensive documentation in Markdown format for the following TypeScript/JavaScript code structures extracted from a file.
    Pay close attention to the provided comments as they contain valuable context.

    Extracted Structures:
    ${structures.map((s, index) => `
    --- Structure ${index + 1} ---
    Name: ${s.name} ${s.isDefaultExport ? '(Default Export)' : (s.isExported ? '(Exported)' : '')}
    Type: ${s.type}
    ${s.comment ? `Existing Comment/Docs:\n\`\`\`\n${s.comment}\n\`\`\`\n` : ''}
    ${s.params && s.params.length > 0 ? `Parameters: ${s.params.map(p => `${p.name}${p.type !== 'any' ? `: ${p.type}` : ''}`).join(', ')}\n` : ''}
    ${s.returnType ? `Returns: ${s.returnType}\n` : ''}
    `).join('\n')}
    --- End of Structures ---

    For each structure above, please provide the following in Markdown:
    1.  **Purpose:** A clear, concise explanation of what the function/class/method does. Use the existing comments as a primary source of information if available.
    2.  **Parameters:** (If applicable) List each parameter with its name, type (if known), and a description of its purpose. Infer descriptions from the code logic and existing comments.
        - Format: \`- \`paramName\` ({type}): Description\`
    3.  **Returns:** (If applicable) Describe what the function/method returns, including its type.
        - Format: \`@returns {type} Description\`
    4.  **Example:** (Optional but helpful) Provide a simple, clear usage example in a code block.

    Structure the overall output clearly, perhaps using headings for each documented item (e.g., \`### Function: [Name]\` or \`### Class: [Name]\`).
    Focus on clarity, accuracy, and leveraging any existing comments effectively. Do not just repeat the code.
  `;

  try {
    // console.log("Sending prompt to Gemini:", prompt); // Log the prompt for debugging (can be long)
    console.log(`Sending ${structures.length} structures to Gemini for documentation.`);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("Received response from Gemini."); // Log success

    return text;

  } catch (error: any) {
    console.error("Error generating documentation via Gemini:", error);
    if (error.message.includes('API key not valid')) {
        return "Error: Invalid Gemini API Key. Please check your .env file.";
    }
    // Re-throw or return a more specific error message
    return `Error generating documentation via Gemini: ${error.message}`;
  }
}
