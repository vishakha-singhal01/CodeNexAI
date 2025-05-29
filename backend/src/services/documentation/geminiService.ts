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
export async function generateAIDocumentation(code: string, filename?: string, docType: string = "Codebase Documentation", diagramType?: string): Promise<string> {
  if (!code || code.trim() === "") {
    return "No code provided to document.";
  }

  let prompt = "";

  switch (docType) {
    case "Sequence Diagram":
      prompt = `
Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''} and generate a detailed **Sequence Diagram** using Mermaid syntax.

### Requirements:
- Show the chronological interaction between objects/components.
- Clearly represent messages, method calls, and responses.
- Annotate lifelines and activation bars meaningfully.
- Include asynchronous and synchronous interactions where relevant.
- **Optimization Notes**: Briefly suggest improvements in interaction flow or message efficiency.
- **Security Risks**: Highlight any risky interaction patterns, such as insecure data passing or unvalidated calls.

### Code:
\`\`\`
${code}
\`\`\`

Return the Mermaid sequence diagram code with optimization and security notes.
`;
      break;

    case "UML Diagram":
      prompt = `
Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''} and generate a **UML Class Diagram** using Mermaid syntax.

### Requirements:
- Include classes/interfaces with attributes and methods.
- Show relationships: inheritance, composition, aggregation, and dependencies.
- Annotate visibility (public, private, protected) if applicable.
- Capture key design patterns or architectural principles.
- **Optimization Notes**: Suggest improvements in class design, coupling, or cohesion.
- **Security Risks**: Point out any unsafe class dependencies or access concerns.

### Code:
\`\`\`
${code}
\`\`\`

Return the Mermaid UML class diagram code along with optimization and security notes.
`;
      break;

    case "Flowchart":
      prompt = `
Analyze the following code snippet${filename ? ` from the file "${filename}"` : ''} and create a **Flowchart** using Mermaid syntax.

### Requirements:
- Represent the logic flow including decisions, loops, and processes.
- Clearly label nodes and transitions.
- Highlight critical paths and error handling branches.
- **Optimization Notes**: Suggest improvements in the flow or simplify complex branches.
- **Security Risks**: Identify insecure or risky decision points or data flows.

### Code:
\`\`\`
${code}
\`\`\`

Return the Mermaid flowchart code along with optimization and security notes.
`;
      break;
    
    case "API Documentation":
      prompt = `
Document the following code as if it were part of a public API.

### Instructions:
- Include **function/class name**, **parameters**, **return type**, and **usage example**.
- Document optional/default parameters clearly.
- Add **optimization** tips if there are better patterns or simplifications.
- Mention **security** precautions (e.g., input validation, XSS, access control) where relevant.

### Code:
\`\`\`
${code}
\`\`\`

Output API-style documentation with optimization and security guidance.
`;
      break;

    case "Codebase Documentation":
      prompt = `
Create internal developer documentation for the code below.

### Include:
- Purpose of the code in the context of a larger system.
- Clear explanation of logic and key variables/functions.
- How it connects to other modules (if apparent).
- Optimization suggestions: Improve logic, readability, performance.
- Security tips: Avoid unsafe data patterns or API misuse.

### Code:
\`\`\`
${code}
\`\`\`

Output clean, maintainable documentation for team use.
`;
      break;

    case "Tutorials/Guides":
      prompt = `
Write a usage guide for the code provided.

### Include:
- What the code does and where it's useful.
- How to use it step-by-step.
- Code examples with explanations.
- Optimization suggestions to improve performance or clarity.
- Security considerations developers should follow when using this.

### Code:
\`\`\`
${code}
\`\`\`

Output the guide in friendly, clear Markdown format.
`;
      break;

    case "Conceptual Overviews":
      prompt = `
Write a conceptual explanation of the code below.

### Cover:
- What it does and why it exists.
- Abstract principles or patterns involved (e.g., hooks, memoization, recursion).
- Any performance optimization insights.
- Any potential security flaws or design pitfalls.

### Code:
\`\`\`
${code}
\`\`\`

Output an in-depth conceptual explanation with optimization/security coverage.
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
