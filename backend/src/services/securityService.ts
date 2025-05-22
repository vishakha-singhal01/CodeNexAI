import { generateAISecurityAnalysis } from './documentation/geminiService';

export async function analyzeCodeSecurity(code: string): Promise<string> {
  try {
    console.log('analyzeCodeSecurity: Calling generateAISecurityAnalysis');
    const analysisResult = await generateAISecurityAnalysis(code, 'security_analysis');
    console.log('analyzeCodeSecurity: Received analysisResult:', analysisResult);
    return analysisResult || 'No result received.';
  } catch (error: unknown) {
    console.error('analyzeCodeSecurity: Error analyzing code security:', error);
    return `Error analyzing code security: ${(error as Error).message || 'Unknown error'}`;
  }
}
