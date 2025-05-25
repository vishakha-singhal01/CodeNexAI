import { parseCode } from './parser';
import { generateEmbedding } from './embedding';
import { storeEmbedding, searchCode } from './vector-store';
import * as fs from 'fs';

import { preprocessText } from './nlp';

import * as path from 'path';

export async function indexCodebase(directory: string) {
  const absoluteDirectory = path.resolve(directory);
  const files = await fs.promises.readdir(absoluteDirectory);

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx')) {
      try {
        const codeChunks = await parseCode(`${directory}/${file}`);
        if (codeChunks.length > 0) {
          console.log(`Parsed ${codeChunks.length} chunks from ${file}`);
          for (const chunk of codeChunks) {
            const embedding = await generateEmbedding(chunk.content);
            await storeEmbedding(`${file}-${chunk.name}`, embedding);
          }
        } else {
          console.log(`No chunks parsed from ${file}`);
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

export async function codeSearch(query: string): Promise<string[]> {
  // Process the query using NLP techniques
  const processedQuery = processNaturalLanguageQuery(query);

  return searchCode(processedQuery);
}

function processNaturalLanguageQuery(query: string): string {
  // Preprocess the query
  return preprocessText(query);
}

(async () => {
  await indexCodebase(process.cwd());
})();
