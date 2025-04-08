import * as parser from "@babel/parser";
// Correct import for traverse and NodePath
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { CodeDocumentation } from "./types"; // Import the interface

/**
 * Extracts formatted leading comments from a Babel AST node path.
 * @param path The NodePath object from Babel traverse.
 * @returns The formatted comment string or null.
 */
export function getLeadingComments(path: NodePath<any>): string | null {
    // Babel's attachComment: true in parser options is often more reliable
    const comments = path.node.leadingComments || path.node.comments;
    if (comments && comments.length > 0) {
        // Join multi-line comments and clean up comment syntax (/*, *, */)
        return comments
            // Filter block comments specifically if needed, or handle both line/block
            .filter((comment: t.Comment) => comment.type === "CommentBlock" || comment.type === "CommentLine") // Add type here
            .map((comment: t.Comment) =>
                comment.value
                    .split('\n')
                    .map((line: string) => line.trim().replace(/^\*?\s?/, '')) // Add explicit type for line
                    .join('\n')
                    .trim()
            ).join('\n\n'); // Separate multiple comment blocks
    }
    return null;
}

/**
 * Extracts parameter details including type annotations.
 * @param params Array of Babel parameter nodes.
 * @returns Array of parameter info objects.
 */
// Adjust input type to include TSParameterProperty
export function extractParams(params: Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>): any[] {
    return params.map((p: any) => { // Keep 'any' for now, complex param types exist
        let name = 'unknown';
        let paramNode = p;

        // Handle TSParameterProperty (e.g., constructor(public name: string))
        if (t.isTSParameterProperty(p)) {
            paramNode = p.parameter;
        }

        // Extract name based on the actual parameter node type
        if (t.isIdentifier(paramNode)) {
            name = paramNode.name;
        } else if (t.isAssignmentPattern(paramNode) && t.isIdentifier(paramNode.left)) {
            name = paramNode.left.name; // Handle default values, e.g., foo = 1
        } else if (t.isRestElement(paramNode) && t.isIdentifier(paramNode.argument)) {
            name = `...${paramNode.argument.name}`; // Handle rest parameters
        } else if (t.isObjectPattern(paramNode)) {
             name = '{...}'; // Placeholder for object destructuring
        } else if (t.isArrayPattern(paramNode)) {
             name = '[...]'; // Placeholder for array destructuring
        }


        // Basic type extraction - can be made more robust
        const typeAnnotation = paramNode.typeAnnotation?.typeAnnotation; // Use paramNode here
        let type = 'any';
        if (t.isTSTypeReference(typeAnnotation) && t.isIdentifier(typeAnnotation.typeName)) {
            type = typeAnnotation.typeName.name;
        } else if (t.isTSStringKeyword(typeAnnotation)) {
            type = 'string';
        } else if (t.isTSNumberKeyword(typeAnnotation)) {
            type = 'number';
        } else if (t.isTSBooleanKeyword(typeAnnotation)) {
            type = 'boolean';
        } // Add more TS type keywords as needed (TSAnyKeyword, TSVoidKeyword, etc.)

        return { name, type };
    });
}

/**
 * Extracts the return type from a function or method node.
 * @param node The Babel node for the function/method.
 * @returns The return type as a string or null.
 */
export function extractReturnType(node: t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression | t.ClassMethod): string | null {
    // Check if returnType exists and is a TSTypeAnnotation before accessing its typeAnnotation
    if (node.returnType && t.isTSTypeAnnotation(node.returnType)) {
        const returnTypeAnnotation = node.returnType.typeAnnotation;
        if (t.isTSTypeReference(returnTypeAnnotation) && t.isIdentifier(returnTypeAnnotation.typeName)) {
            return returnTypeAnnotation.typeName.name;
        } else if (t.isTSStringKeyword(returnTypeAnnotation)) {
            return 'string';
        } else if (t.isTSNumberKeyword(returnTypeAnnotation)) {
            return 'number';
        } else if (t.isTSBooleanKeyword(returnTypeAnnotation)) {
            return 'boolean';
        } else if (t.isTSVoidKeyword(returnTypeAnnotation)) {
            return 'void';
        } // Add more TS type keywords
    } // End of check: if (node.returnType && t.isTSTypeAnnotation(node.returnType))
    return null;
}

/**
 * Parses TypeScript/JavaScript code and extracts information about functions/classes.
 * @param code The code content as a string.
 * @param filename Optional filename for context.
 * @returns An array of objects containing extracted code structure information.
 */
export function extractCodeStructures(code: string, filename?: string): CodeDocumentation[] {
    let ast: t.File;
    try {
        ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx", "decorators-legacy"], // Enable TS, JSX, and decorators
            tokens: true, // Needed for comment extraction in some cases
            attachComment: true,
        });
    } catch (error: any) {
        console.error("Babel parsing error:", error.message);
        // Return an empty array or throw a more specific error
        return [];
    }


    const structures: CodeDocumentation[] = [];
    const structureMap = new Map<number | null | undefined, CodeDocumentation>(); // Map start position to structure

    const addStructure = (structure: CodeDocumentation) => {
        if (structure.start !== undefined && structure.start !== null) {
            structures.push(structure);
            structureMap.set(structure.start, structure);
        }
    };

    traverse(ast, {
        FunctionDeclaration(path) {
            const node = path.node;
            const structure: CodeDocumentation = {
                name: node.id?.name || 'anonymous',
                type: node.type,
                params: extractParams(node.params),
                returnType: extractReturnType(node),
                comment: getLeadingComments(path),
                start: node.start,
                end: node.end,
                isExported: false, // Default, will be updated by export visitors
                isDefaultExport: false,
                filename: filename, // Add filename
            };
            addStructure(structure);
        },
        ClassDeclaration(path) {
            const node = path.node;
            const structure: CodeDocumentation = {
                name: node.id?.name || 'anonymous',
                type: node.type,
                comment: getLeadingComments(path),
                start: node.start,
                end: node.end,
                isExported: false,
                isDefaultExport: false,
                filename: filename, // Add filename
                // Methods will be added separately
            };
            addStructure(structure);
        },
        ClassMethod(path) {
            const node = path.node;
            // Find the parent class structure
            const parentClassPath = path.findParent((p) => p.isClassDeclaration());
            const parentClassNode = parentClassPath?.node as t.ClassDeclaration | undefined;
            const parentClassName = parentClassNode?.id?.name || 'anonymous';

            let methodName = 'constructor'; // Default for constructor
            if (t.isIdentifier(node.key)) {
                methodName = node.key.name;
            } else if (t.isPrivateName(node.key)) {
                // Explicitly cast node.key to PrivateName to help TS
                const privateKey = node.key as t.PrivateName;
                methodName = `#${privateKey.id.name}`; // Handle private methods #method
            }
            // Could also be StringLiteral, NumericLiteral etc. for computed names

            const structure: CodeDocumentation = {
                name: `${parentClassName}.${methodName}`, // Combine class and method name
                type: node.type,
                params: extractParams(node.params),
                returnType: extractReturnType(node),
                comment: getLeadingComments(path),
                start: node.start,
                end: node.end,
                isExported: false, // Methods aren't directly exported this way
                isDefaultExport: false,
                filename: filename, // Add filename
            };
            addStructure(structure);
        },
        VariableDeclaration(path) {
            // Check for arrow functions assigned to variables (e.g., const myFunction = () => {})
            path.node.declarations.forEach(declaration => {
                if (t.isIdentifier(declaration.id) && (t.isArrowFunctionExpression(declaration.init) || t.isFunctionExpression(declaration.init))) {
                    const node = declaration.init;
                    const structure: CodeDocumentation = {
                        name: declaration.id.name,
                        type: node.type, // ArrowFunctionExpression or FunctionExpression
                        params: extractParams(node.params),
                        returnType: extractReturnType(node),
                        comment: getLeadingComments(path), // Get comments from the VariableDeclaration path
                        start: path.node.start, // Use VariableDeclaration start/end
                        end: path.node.end,
                        isExported: false,
                        isDefaultExport: false,
                        filename: filename, // Add filename
                    };
                    addStructure(structure);
                }
            });
        },
        ExportNamedDeclaration(path) {
            const declaration = path.node.declaration;
            if (declaration && (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration) || t.isVariableDeclaration(declaration))) {
                // If the declaration is directly part of the export (e.g., export function foo() {})
                // Find the corresponding structure already created and mark it as exported
                const existingStructure = structureMap.get(declaration.start);
                if (existingStructure) {
                    existingStructure.isExported = true;
                } else {
                    // Handle cases where the structure might not have been added yet (e.g. export const fn = () => {})
                    // This might require re-traversing or adjusting the order. For simplicity, we assume it exists.
                    console.warn("Could not find existing structure for named export:", declaration.type);
                }
            } else if (path.node.specifiers.length > 0) {
                // Handle re-exports or specific exports (e.g., export { foo, bar };)
                // This requires resolving the identifiers, which adds complexity. Skipped for now.
            }
        },
        ExportDefaultDeclaration(path) {
            const declaration = path.node.declaration;
            if (declaration && (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration) || t.isIdentifier(declaration) || t.isArrowFunctionExpression(declaration) || t.isFunctionExpression(declaration))) {
                 // Find the corresponding structure already created and mark it as default export
                const existingStructure = structureMap.get(declaration.start);
                 if (existingStructure) {
                    existingStructure.isExported = true;
                    existingStructure.isDefaultExport = true;
                } else {
                     // Handle anonymous default exports e.g. export default () => {}
                     if (t.isArrowFunctionExpression(declaration) || t.isFunctionExpression(declaration)) {
                         const node = declaration;
                         const structure: CodeDocumentation = {
                             name: 'default', // Assign 'default' name
                             type: node.type,
                             params: extractParams(node.params),
                             returnType: extractReturnType(node),
                             comment: getLeadingComments(path), // Get comments from ExportDefaultDeclaration path
                             start: node.start,
                             end: node.end,
                             isExported: true,
                             isDefaultExport: true,
                             filename: filename, // Add filename
                         };
                         addStructure(structure);
                     } else if (t.isClassDeclaration(declaration) && !declaration.id) {
                         const node = declaration;
                         const structure: CodeDocumentation = {
                             name: 'default', // Assign 'default' name
                             type: node.type,
                             comment: getLeadingComments(path),
                             start: node.start,
                             end: node.end,
                             isExported: true,
                             isDefaultExport: true,
                             filename: filename, // Add filename
                         };
                         addStructure(structure);
                     } else {
                        console.warn("Could not find existing structure for default export:", declaration.type);
                     }
                 }
            }
        }
    });

    // Sort structures by start position for better readability in prompt
    structures.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

    return structures;
}
