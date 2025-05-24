import { parseCode } from './parser';
import { generateEmbedding } from './embedding';
import { storeEmbedding, searchCode } from './vector-store';
import * as fs from 'fs';

export async function indexCodebase(directory: string) {
  const files = await fs.promises.readdir(directory);

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      try {
        const codeChunks = await parseCode(`${directory}/${file}`);
        for (const chunk of codeChunks) {
          const embedding = await generateEmbedding(chunk.content);
          await storeEmbedding(`${file}-${chunk.name}`, embedding);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`Error indexing ${file}:`, error.message);
        } else {
          console.error(`Error indexing ${file}:`, error);
        }
      }
    }
  }
}

export async function codeSearch(query: string): Promise<any[]> {
  // Process the query using NLP techniques
  const processedQuery = processNaturalLanguageQuery(query);

  return searchCode(processedQuery);
}

function processNaturalLanguageQuery(query: string): string {
  // TODO: Implement NLP processing here
  return query;
}
