// Import necessary functions and types from the new modules
import { extractCodeStructures } from "./documentation/astUtils";
import { generateAIDocumentation } from "./documentation/geminiService";

/**
 * Orchestrates the documentation generation process.
 * 1. Extracts code structures using AST analysis.
 * 2. Sends the structures to the AI service for documentation generation.
 * @param code The code content as a string.
 * @param filename Optional filename for context.
 * @returns A promise that resolves to the generated documentation string (Markdown).
 */
export async function generateDocumentation(code: string, filename?: string): Promise<string> {
  try {
    // 1. Extract structures using the utility function
    const structures = extractCodeStructures(code, filename);

    // Handle case where no structures are found by the parser
    if (structures.length === 0) {
        return "No documentable structures (functions, classes, methods) found in the code.";
    }

    // 2. Generate documentation using the AI service
    const documentation = await generateAIDocumentation(structures);

    return documentation;

  } catch (error: any) {
    // Catch errors from either structure extraction or AI generation
    console.error("Error in generateDocumentation:", error);
    // Return a generic error or re-throw specific errors if needed
    return `Error generating documentation: ${error.message}`;
  }
}

// Example usage can be moved to a separate test file or kept here if desired.
// The core logic is now delegated.
