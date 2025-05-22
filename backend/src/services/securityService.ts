import axios from 'axios';

const API_BASE_URL = 'https://gemini.example.com/api'; // Placeholder URL

export async function analyzeCodeSecurity(code: string): Promise<string> {
  const apiUrl = `${API_BASE_URL}/security_analysis`;

  try {
    const response = await axios.post(apiUrl, { code });

    if (response.status !== 200) {
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }

    const data = response.data as { report: string };
    return data.report || 'No result received.';
  } catch (error: unknown) {
    return `Error analyzing code security: ${(error as Error).message || 'Unknown error'}`;
  }
}
