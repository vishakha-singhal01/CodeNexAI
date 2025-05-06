import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button"; // Assuming Button component is stable

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login from AuthContext to set user state after successful OAuth
  const [error, setError] = useState<string | null>(null);

  // Explicitly get and log the API base URL to ensure it's loaded
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('SignupPage VITE_API_BASE_URL:', apiBaseUrl);

  // Render an error message if the API base URL is not set
  if (!apiBaseUrl) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <h1>Configuration Error</h1>
        <p>VITE_API_BASE_URL is not defined in your environment variables.</p>
        <p>Please ensure it is set in your .env file and the application is rebuilt/restarted if necessary.</p>
      </div>
    );
  }

  const handleGoogleSignup = () => {
    console.log('Attempting Google signup/login...');
    // Google OAuth typically handles both signup and login through the same endpoint.
    // The backend will create a new user if one doesn't exist or log in an existing user.
    window.open(`${apiBaseUrl}/api/auth/google`, '_blank', 'width=500,height=600,noopener,noreferrer');
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Signup Page: Message received:', event.data);

      // Verify the origin of the message for security
      let expectedOrigin = '';
      try {
        expectedOrigin = new URL(apiBaseUrl).origin;
      } catch (e) {
        console.error("Signup Page: Invalid VITE_API_BASE_URL for origin check:", apiBaseUrl, e);
        setError("Configuration error: Invalid API base URL for origin check.");
        return;
      }

      if (event.origin !== expectedOrigin) {
        console.warn(`Signup Page: Message rejected from origin: ${event.origin}. Expected: ${expectedOrigin}`);
        // setError(`Security warning: Message from unexpected origin ${event.origin}.`);
        // return; 
      } else {
        console.log(`Signup Page: Message origin ${event.origin} verified.`);
      }

      if (typeof event.data !== 'object' || event.data === null || !event.data.type) {
        console.log('Signup Page: Received message is not in the expected format (missing type).', event.data);
        return;
      }

      const { type, user, error: messageError } = event.data;

      if (type === 'auth-success' && user) {
        console.log('OAuth success message received on signup page:', user);
        login(user); // Update auth context with the user data
        navigate('/'); // Redirect to home page after successful signup/login
      } else if (type === 'auth-error') {
        console.error('OAuth error message received on signup page:', messageError);
        setError(messageError || 'OAuth authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [login, navigate, apiBaseUrl]); // Add apiBaseUrl to dependencies

  return (
    <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Signup Page</h1>
      <p style={{ margin: '10px 0' }}>
        VITE_API_BASE_URL is configured as: <strong>{apiBaseUrl}</strong>
      </p>
      <Button onClick={handleGoogleSignup} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Sign up / Login with Google
      </Button>
      {error && (
        <p style={{ color: 'red', marginTop: '20px', border: '1px solid red', padding: '10px' }}>
          <strong>Error:</strong> {error}
        </p>
      )}
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
        <p><strong>Troubleshooting Tips:</strong></p>
        <ul style={{ textAlign: 'left', listStylePosition: 'inside' }}>
          <li>Check the browser's developer console (usually F12) for any error messages.</li>
          <li>Ensure the backend server at <code>{apiBaseUrl}</code> is running and accessible.</li>
          <li>Verify that the Google OAuth client ID and secret are correctly configured on the backend.</li>
          <li>Confirm that the redirect URIs in your Google Cloud Console match <code>{apiBaseUrl}/api/auth/google/callback</code>.</li>
        </ul>
      </div>
       <p style={{ marginTop: '20px' }}>
        Already have an account? <a href="/login" style={{ textDecoration: 'underline' }}>Login here</a>
      </p>
    </div>
  );
}
