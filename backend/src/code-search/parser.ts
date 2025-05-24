import { extractCodeStructures } from '../services/documentation/astUtils';
import * as fs from 'fs';

export async function parseCode(filePath: string): Promise<any[]> {
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const codeChunks = extractCodeStructures(fileContent);
  return codeChunks;
}
