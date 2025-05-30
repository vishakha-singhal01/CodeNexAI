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

- 🔍 List **all available endpoints**, grouped by feature/module with clear, interactive tables.
- 📥 Document **parameters**: name, type, requirement (required/optional), and description using well-structured tables.
- 📤 Include detailed example **requests and responses** with real data in syntax-highlighted code blocks.
- 🔐 Document **authentication methods**, token flow, and scopes with flow diagrams and charts.
- 📊 Add **interactive tables, Swagger/OpenAPI-style diagrams**, and **status code charts** for quick reference.
- 💡 Include **developer tips**, edge cases, and security best practices with visually distinct callouts.
- 🧪 Add **Postman-like test case snippets** for each endpoint, embedded in collapsible blocks.

Focus on delivering a **clean, vibrant, and intuitive experience** for developers integrating with this API, leveraging charts, tables, and diagrams throughout.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Codebase Documentation":
      prompt = `
Generate a **thorough and professional codebase documentation** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📦 Describe each **module, class, and function** — their purpose, inputs, outputs, and behavior using color-coded, syntax-highlighted blocks.
- 🔄 Visualize **component relationships** using detailed **class diagrams (Mermaid)** and **dependency graphs**.
- 🧠 Highlight **design patterns**, **key algorithms**, and **architectural decisions** using flow diagrams and charts.
- 🧩 Include a **dependency graph** and **folder structure tree view** with interactive elements if possible.
- 💬 Annotate with **comments, gotchas, and caveats** using callouts and side notes.
- 🔧 Recommend improvements, optimizations, and refactors where applicable.
- 🌈 Use tables, diagrams, syntax-highlighted code blocks, and color-coded sections for maximum clarity.

Target: **Developers onboarding or extending the codebase**, with a strong focus on visual aids to grasp structure quickly.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Tutorials/Guides":
      prompt = `
Generate an **engaging, step-by-step tutorial or guide** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🧭 Include a **table of contents** with clickable anchors.
- 🧱 Break down tasks with **step-wise instructions**, using headings, subheadings, and clear, color-coded code blocks.
- 📸 Add **code screenshots**, terminal outputs, flow diagrams, and embedded interactive snippets where helpful.
- 🔁 Include **real use cases**, common pitfalls, and alternate flows visually explained via diagrams or flowcharts.
- 🔧 Add **interactive code snippets** or embedded sandboxes (if supported) for live experimentation.
- 💬 Provide helpful tooltips, notes, references, and highlighted tips in callouts.
- 🌟 Make it colorful, modern, and fun for developers and beginners with consistent visual styling.

Audience: Developers looking to **learn and apply** the code practically, with visuals that enhance comprehension.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Conceptual Overviews":
      prompt = `
Generate a **conceptual overview document** that explains the high-level structure and design of the following code${filename ? ` from the file "${filename}"` : ''}:

- 🏗️ Describe the **system architecture** using clear, layered diagrams and architectural charts.
- 🌐 Explain core **design principles**, **modules**, and their roles with visual block diagrams.
- 🧩 Include component interaction diagrams, data flow charts, and configuration hierarchies.
- 🔍 Highlight **domain concepts**, business logic layers, and integration points with easy-to-follow visuals.
- 🎯 Add **stakeholder-friendly visuals** (boxes/arrows, layered architecture) and color-coded callouts.
- 📌 Use **color-coded blocks**, summary tables, and callouts for emphasis.

Audience: **Stakeholders, architects, and non-technical audiences** needing the big picture supported by engaging visuals.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Sequence Diagram":
      prompt = `
Generate a **MermaidJS-based Sequence Diagram** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🧑‍🤝‍🧑 Clearly show **actors**, components, and message exchanges with labeled arrows.
- ⏱️ Annotate with **activation bars**, **lifelines**, and **method call order**.
- 🔄 Distinguish **sync/async flows** using solid and dashed arrows.
- ❗ Highlight **critical paths**, bottlenecks, and exception handlers using color-coded notes.
- 📌 Add notes beside complex steps explaining purpose, risks, or alternatives.
- 🧩 Visuals should be **clean**, **color-coded**, and logically grouped for clarity.

Goal: Help developers understand **runtime behavior and component interactions** via visually compelling sequence diagrams.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "UML Diagram":
      prompt = `
Generate a **UML Class Diagram using Mermaid syntax** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📦 Show all **classes, interfaces, attributes, and methods** with visibility (+/-/#).
- 🧬 Represent relationships: **inheritance, composition, association, dependencies** with arrows and labels.
- 🔐 Annotate with access modifiers (public/private/protected) and stereotypes.
- 🎨 Use **color coding or tags** for abstract classes, interfaces, and critical components.
- 🧠 Add design insights: **SRP violations**, **refactor suggestions**, or SOLID principle adherence in callouts.
- 📌 Include a **legend** for readability and quick reference.

Purpose: Help developers and architects understand **code structure and design hierarchy** with clear, colorful diagrams.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Flowchart":
      prompt = `
Generate a **Mermaid-based Flowchart** for the following code logic${filename ? ` from the file "${filename}"` : ''}:

- 🚀 Start from the entry point and **map the flow** step-by-step with clear nodes.
- 🔁 Show **loops**, **conditionals**, and **function calls** visually.
- ❗ Highlight **decision points**, error states, and edge cases with distinct icons and colors.
- 🌈 Use **vibrant colors**, **icons**, and **symbols** to improve visual clarity and engagement.
- 💬 Annotate complex branches and provide **optimization tips** and **security notes** using callouts.
- 📌 Clearly label each node, and add **a legend** or tooltip guide for users.

Intended for: Developers needing a quick yet powerful **visual of logic flow** for easier debugging and understanding.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Release Notes":
      prompt = `
Generate professional **release notes** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📝 Summarize new features, bug fixes, and improvements.
- 📅 Include version number, release date, and upgrade instructions.
- ⚠️ Highlight any breaking changes or deprecations.
- 🔗 Provide links to relevant documentation or issue trackers.
- 💬 Use clear, concise language suitable for developers and stakeholders.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "API Change Log":
      prompt = `
Generate a detailed **API change log** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🔄 List all added, modified, deprecated, and removed API endpoints.
- 📊 Include versioning info and dates for each change.
- 🧩 Explain impact on existing integrations with examples.
- 🛠️ Suggest migration steps and backward compatibility notes.
- 📚 Provide links to related documentation and usage samples.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Troubleshooting Guide":
      prompt = `
Create a comprehensive **troubleshooting guide** for the following code${filename ? ` from the file "${filename}"` : ''}:

- ⚠️ List common issues and error messages with explanations.
- 🔍 Provide step-by-step diagnosis and resolution steps.
- 🧪 Include sample test cases and expected outputs.
- 💡 Add tips for debugging and avoiding pitfalls.
- 📞 Suggest support contacts and resources.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Security Guidelines":
      prompt = `
Develop detailed **security guidelines** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🔐 Outline best practices for authentication and authorization.
- 🛡️ Describe input validation, data sanitization, and encryption methods.
- 🚨 Highlight potential vulnerabilities and mitigation strategies.
- 📝 Include compliance standards and audit recommendations.
- 📊 Provide security testing procedures and monitoring tips.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Performance Analysis":
      prompt = `
Produce an in-depth **performance analysis report** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 📈 Measure and report key performance metrics and bottlenecks.
- 🛠️ Suggest optimizations and refactoring for speed and scalability.
- 🔬 Include profiling data and memory usage charts.
- ⚙️ Discuss concurrency, caching, and resource management.
- 💡 Provide benchmarking results with recommendations.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Integration Guide":
      prompt = `
Generate a clear **integration guide** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🔗 Describe how to connect and configure the system or API.
- 📥 Provide step-by-step setup instructions with code examples.
- 🧩 Detail dependencies, prerequisites, and environment setup.
- 🔄 Explain data flow and synchronization points with diagrams.
- 💬 Add troubleshooting tips and common integration pitfalls.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "FAQ":
      prompt = `
Create a detailed **FAQ (Frequently Asked Questions)** document for the following code${filename ? ` from the file "${filename}"` : ''}:

- ❓ List common questions and clear, concise answers.
- 🛠️ Address usage scenarios, limitations, and troubleshooting.
- 📚 Provide references to deeper documentation and resources.
- 💡 Include tips, best practices, and alternative approaches.
- 🔄 Update regularly to reflect user feedback and changes.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    case "Architecture Overview":
      prompt = `
Write an engaging **architecture overview** for the following code${filename ? ` from the file "${filename}"` : ''}:

- 🏗️ Outline the overall system design and component breakdown.
- 🌐 Include high-level diagrams showing interactions and data flow.
- 🧩 Describe key modules, services, and their responsibilities.
- 🔍 Highlight design patterns, scalability, and fault tolerance.
- 📌 Add insights on deployment, infrastructure, and technology stack.

Audience: Developers, architects, and technical stakeholders needing a clear big-picture understanding.

### Code:
\`\`\`
${code}
\`\`\`
`;
      break;

    default:
      prompt = `
Generate clean, well-structured **developer documentation** for the following code${filename ? ` from the file "${filename}"` : ''} with:

- 📄 Clear sectioning and formatting with headings and subheadings.
- 📌 Explanations of code logic, usage examples, and contextual notes.
- 🌐 Visual aids such as diagrams, tables, and charts where appropriate.
- 🧠 Emphasis on clarity, best practices, and purpose of each component.
- 🌈 Use modern, colorful formatting with syntax highlighting, callouts, and code blocks for readability.

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
