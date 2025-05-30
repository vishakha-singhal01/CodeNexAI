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
    case "API Documentation":
      prompt = `
Generate an expert-level, visually engaging **API documentation** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🔍 List **all available endpoints**, grouped by feature/module.
- 📥 Document **parameters**: name, type, requirement (required/optional), and description in a table.
- 📤 Include example **requests/responses** with real data.
- 🔐 Document **authentication methods**, token flow, and scopes if applicable.
- 📊 Add **interactive tables**, diagrams (like Swagger/OpenAPI style), and **status code charts**.
- 💡 Include **developer tips**, edge cases, and security best practices.
- 🧪 Add **Postman-like test case snippets** for each endpoint.

Focus on delivering a **clean, vibrant, and intuitive experience** for developers integrating with this API.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Codebase Documentation":
      prompt = `
Generate a **thorough and professional codebase documentation** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📦 Describe each **module, class, and function** — their purpose, inputs, outputs, and behavior.
- 🔄 Visualize **component relationships** using class diagrams (Mermaid).
- 🧠 Highlight **design patterns**, **key algorithms**, and **architectural decisions**.
- 🧩 Include a **dependency graph** and **folder structure tree view**.
- 💬 Annotate with **comments, gotchas, and caveats**.
- 🔧 Recommend improvements, optimizations, and refactors where applicable.
- 🌈 Use tables, diagrams, syntax-highlighted code blocks, and color-coded sections for clarity.

Target: **Developers onboarding or extending the codebase**.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Tutorials/Guides":
      prompt = `
Generate an **engaging, step-by-step tutorial or guide** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🧭 Include a **table of contents** at the beginning.
- 🧱 Break down tasks with **step-wise instructions**, using headings, subheadings, and code blocks.
- 📸 Add **code screenshots**, terminal outputs, or flow diagrams where helpful.
- 🔁 Include **real use cases**, common pitfalls, and alternate flows.
- 🔧 Add **interactive code snippets** or embedded sandboxes (if supported).
- 💬 Provide helpful tooltips, notes, and references.
- 🌟 Make it colorful, modern, and fun for developers and beginners.

Audience: Developers looking to **learn and apply** the code practically.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Conceptual Overviews":
      prompt = `
Generate a **conceptual overview document** that explains the high-level structure and design of the following code${filename ? ` from the file "${filename}"` : ''}:

- 🏗️ Describe the **system architecture** with diagrams.
- 🌐 Explain core **design principles**, **modules**, and their roles.
- 🧩 Include component interaction diagrams, data flow, and configuration hierarchy.
- 🔍 Highlight **domain concepts**, business logic layers, and integration points.
- 🎯 Add **stakeholder-friendly visuals** (boxes/arrows, layered architecture).
- 📌 Use **color-coded blocks**, summary tables, and callouts for emphasis.

Audience: **Stakeholders, architects, and non-technical audiences** needing the big picture.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Sequence Diagram":
      prompt = `
Generate a **MermaidJS-based Sequence Diagram** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🧑‍🤝‍🧑 Clearly show **actors**, components, and message exchanges.
- ⏱️ Annotate with **activation bars**, **lifelines**, and **method call order**.
- 🔄 Distinguish **sync/async flows** with appropriate arrows.
- ❗ Highlight **critical paths**, bottlenecks, and exception handlers.
- 📌 Add notes beside complex steps explaining purpose or risk.
- 🧩 Visuals should be **clean**, **color-coded**, and logically grouped.

Goal: Help developers understand **runtime behavior and component interactions**.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "UML Diagram":
      prompt = `
Generate a **UML Class Diagram using Mermaid syntax** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📦 Show all **classes, interfaces, attributes, and methods** with visibility.
- 🧬 Represent relationships: **inheritance, composition, association, dependencies**.
- 🔐 Annotate with access modifiers (public/private/protected).
- 🎨 Use **color coding or tags** for abstract classes, interfaces, and critical components.
- 🧠 Add design insights: **SRP violations**, **refactor suggestions**, or SOLID adherence.
- 📌 Include a **legend** for readability.

Purpose: Help developers and architects understand **code structure and design hierarchy**.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Flowchart":
      prompt = `
Generate a **Mermaid-based Flowchart** for the following code logic${filename ? ` from the file "${filename}"` : ''}:

- 🚀 Start from the entry point and **map the flow** step-by-step.
- 🔁 Show **loops**, **conditionals**, and **function calls** clearly.
- ❗ Highlight **decision points**, error states, and edge cases.
- 🌈 Use **vibrant colors**, **icons**, and **symbols** to improve visual clarity.
- 💬 Annotate complex branches and provide **optimization tips** and **security notes**.
- 📌 Clearly label each node, and add **a legend** or tooltip guide.

Intended for: Developers needing a quick yet powerful **visual of logic flow**.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    default:
      prompt = `
Generate clean, well-structured **developer documentation** for the following code${filename ? ` from the file "${filename}"` : ''} with:

- 📄 Clear sectioning and formatting
- 📌 Explanations of code logic, usage examples, and context
- 🌐 Visual aids such as diagrams, tables, and charts where appropriate
- 🧠 Emphasis on clarity, best practices, and purpose of each component
- 🌈 Use modern, colorful formatting for improved readability

### Code:
\`\`\`
${code}
\`\`\`
`;
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
