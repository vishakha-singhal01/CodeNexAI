import React, { useState } from 'react';
import axios from 'axios';

interface SecurityAnalyzerProps {
  code: string;
}

const SecurityAnalyzer: React.FC<SecurityAnalyzerProps> = ({ code }) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/security', { code });
      console.log('Response data:', response.data);
      setAnalysisResult(response.data.result);
    } catch (error: unknown) {
      console.error('Error analyzing code:', error);
      setAnalysisResult(`Error analyzing code: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Security Analyzer</h2>
      <button onClick={analyzeCode} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Code'}
      </button>
      {analysisResult && <p>Analysis Result: {analysisResult}</p>}
    </div>
  );
};

export default SecurityAnalyzer;
