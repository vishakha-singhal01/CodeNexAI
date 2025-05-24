import * as natural from 'natural';

export function processNaturalLanguageQuery(query: string): string {
  // Tokenize the query
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(query);

  // Stem the tokens
  const stemmer = natural.PorterStemmer;
  const stemmedTokens = tokens.map((token: string) => stemmer.stem(token));

  // Join the stemmed tokens back into a string
  const processedQuery = stemmedTokens.join(' ');

  return processedQuery;
}
