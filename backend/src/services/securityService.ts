import { generateAIDocumentation } from './documentation/geminiService';

export async function analyzeCodeSecurity(code: string): Promise<string> {
  try {
    const analysisResult = await generateAIDocumentation(code, 'security_analysis');
    return analysisResult || 'No result received.';
  } catch (error: unknown) {
    return `Error analyzing code security: ${(error as Error).message || 'Unknown error'}`;
  }
}
