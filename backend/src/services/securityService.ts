import axios from 'axios';

const API_BASE_URL = 'https://code-whisper-docs.onrender.com';

export async function analyzeCodeSecurity(code: string): Promise<string> {
  const apiUrl = `${API_BASE_URL}/analyze`;

  try {
    const response = await axios.post(apiUrl, { code });

    if (response.status !== 200) {
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }

    const data = response.data as { result: string };
    return data.result || 'No result received.';
  } catch (error: any) {
    return `Error analyzing code security: ${error.message || 'Unknown error'}`;
  }
}
