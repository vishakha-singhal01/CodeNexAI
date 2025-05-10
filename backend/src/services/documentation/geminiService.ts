import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Import safety settings types
import dotenv from 'dotenv';
// No longer need CodeDocumentation type from ./types

dotenv.config(); // Load environment variables

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
// Use a potentially more capable model if needed for detailed analysis, but flash is fast.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define safety settings to potentially allow more code-related content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Adjust if needed for code examples
  },
];


/**
 * Generates detailed, line-by-line documentation for the given code using Gemini.
 * @param code The raw code content as a string.
 * @param filename Optional filename for context.
 * @returns A promise that resolves to the generated documentation string (Markdown).
 */
export async function generateAIDocumentation(code: string, filename?: string): Promise<string> {
  if (!code || code.trim() === "") {
    return "No code provided to document.";
  }

  // Construct the prompt for detailed, line-by-line analysis
  const prompt = `
    Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''}.
Provide documentation in Markdown format. Your goal is to be clear and helpful.

**Instructions for Documentation Verbosity:**
- **For simple, short functions or code blocks (e.g., less than 10-15 lines, straightforward logic):** Provide a concise, one to two-sentence summary of its purpose. If it's a function, briefly state its parameters and return value. Avoid line-by-line explanation unless a specific line is unusually complex or non-obvious.
- **For more complex or longer code snippets:** Provide a more detailed explanation. This can include:
    - The overall purpose.
    - Key variables, functions, classes, or components and their roles.
    - The logic flow and important decision points.
    - Brief explanations of any complex algorithms or operations.
    - Input parameters and return values for functions/methods.
    - Potential edge cases or important considerations if apparent.
- **Overall:** Prioritize clarity and usefulness. Avoid redundant explanations or stating the obvious. Do not just repeat the code.

Identify the programming language if possible.
Format the output clearly using Markdown. Use headings, lists, and code blocks (\`\`\`) for clarity where they add value.

Code Snippet:
\`\`\`
${code}
\`\`\`

Generate the documentation below:
  `;

  try {
    console.log(`Sending code snippet${filename ? ` from ${filename}` : ''} to Gemini for detailed documentation.`);

    // Pass safety settings to the generation request
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      // Consider adding generationConfig if needed (e.g., temperature)
      // generationConfig: { temperature: 0.7 }
    });
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
