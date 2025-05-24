import { extractCodeStructures } from './astUtils';
import * as vscode from 'vscode';

export async function parseCode(filePath: string): Promise<any[]> {
  try {
    const uri = vscode.Uri.file(filePath);
    const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();
    const codeChunks = extractCodeStructures(fileContent);
    return codeChunks;
  } catch (error: any) {
    console.error(`Error reading or parsing file ${filePath}: ${error.message}`);
    return [];
  }
}
