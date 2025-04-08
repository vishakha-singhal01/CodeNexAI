/**
 * Interface defining the structure for extracted code information.
 */
export interface CodeDocumentation {
  name: string;
  type: string; // e.g., 'FunctionDeclaration', 'ClassDeclaration', 'ClassMethod', 'ArrowFunctionExpression'
  description?: string; // Make optional for now
  params?: { name: string; type?: string }[];
  returnType?: string | null; // Changed from returns
  comment?: string | null;
  isExported?: boolean;
  isDefaultExport?: boolean;
  start?: number | null; // Add start position
  end?: number | null;   // Add end position
  filename?: string; // Add filename
  // Add more fields as needed (e.g., examples, decorators)
}
