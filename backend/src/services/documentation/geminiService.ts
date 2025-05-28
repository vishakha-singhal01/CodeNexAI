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
 * @param docType The type of documentation to generate.
 * @param diagramType The type of diagram to generate.
 * @returns A promise that resolves to the generated documentation string (Markdown).
 */
export async function generateAIDocumentation(code: string, filename?: string, docType: string = "detailed", diagramType?: string): Promise<string> {
  if (!code || code.trim() === "") {
    return "No code provided to document.";
  }

  let prompt = "";

  switch (docType) {
    case "detailed":
      prompt = `
Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''} and generate clean, professional Markdown documentation.

### Documentation Guidelines:
- **Brevity First:** 
  - For simple or short snippets (e.g., under ~15 lines): Write a concise summary of what the code does. For functions, include a brief note on parameters and return value.
  - For longer or more complex code: Explain the purpose, logic flow, key components, and any significant algorithms or decisions.
- **Focus on Usefulness:**
  - Prioritize clarity over completeness. Do not describe every line unless needed.
  - Highlight non-obvious behavior, edge cases, or side effects.
  - Identify input/output expectations and key roles of functions, variables, or classes.
- **Code Optimization (if applicable):**
  - Suggest improvements or more efficient alternatives to any part of the code if they are clearly better.
  - Keep suggestions brief, targeted, and valuable.

### Formatting:
- Identify the programming language if possible.
- Use proper Markdown: headings, subheadings, bullet points, and fenced code blocks (\`\`\`) for readability.

### Input Code:
\`\`\`
${code}
\`\`\`

Generate the optimized and clean documentation below:
`;
       break;
    case "diagrammatical":
      prompt = `
Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''} and generate a ${diagramType || 'sequence diagram'} illustrating the code's structure and functionality. Use Mermaid syntax. Ensure the generated Mermaid syntax is valid.
`;
      break;
    default:
      return "Invalid docType";
  }

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
