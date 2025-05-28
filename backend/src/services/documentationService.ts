// Import the AI generation function
import { generateAIDocumentation } from "./documentation/geminiService";

/**
 * Orchestrates the documentation generation process by sending the raw code
 * directly to the AI service for detailed, line-by-line analysis.
 * @param code The code content as a string.
 * @param filename Optional filename for context (can be passed to AI).
 * @param docType The type of documentation to generate.
 * @param diagramTypes The types of diagrams to generate.
 * @returns A promise that resolves to the generated documentation string (Markdown).
 */
export async function generateDocumentation(code: string, filename?: string, docType?: string, diagramTypes?: string[]): Promise<string> {
  try {
    let documentation = "";
    // If docType is not provided, try to extract it from the code
    if (!docType) {
      if (code.includes("API")) {
        docType = "API Documentation";
      } else if (code.includes("class") || code.includes("function")) {
        docType = "Codebase Documentation";
      } else {
        docType = "detailed"; // Default docType
      }
    }

    // Always generate detailed documentation first
    documentation = await generateAIDocumentation(code, filename, docType);

    if (diagramTypes && diagramTypes.length > 0) {
      for (const diagramType of diagramTypes) {
        // Directly pass the raw code and optional filename to the AI service
        // The AI service will be responsible for the detailed analysis.
        const diagramDocumentation = await generateAIDocumentation(code, filename, "diagrammatical", diagramType);
        documentation += `\n\n## ${diagramType}\n${diagramDocumentation}`;
      }
    }

    return documentation;

  } catch (error: any) {
    // Catch errors from the AI generation step
    console.error("Error in generateDocumentation:", error);
    // Return a generic error or re-throw specific errors if needed
    // Consider providing more context if possible, e.g., from the error object
    return `Error generating documentation: ${error.message || 'An unknown error occurred'}`;
  }
}
