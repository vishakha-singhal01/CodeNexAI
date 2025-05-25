export function preprocessText(text: string): string {
  // Lowercase the text
  text = text.toLowerCase();

  // Remove punctuation
  text = text.replace(/[^\w\s]/g, '');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
