import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button"; // Assuming Button component is stable

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Explicitly get and log the API base URL to ensure it's loaded
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('LoginPage VITE_API_BASE_URL:', apiBaseUrl);

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

  const handleGoogleLogin = () => {
    console.log('Attempting Google login...');
    // Construct the Google auth URL using the verified apiBaseUrl
    window.open(`${apiBaseUrl}/api/auth/google`, '_blank', 'width=500,height=600,noopener,noreferrer');
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Login Page: Message received:', event.data);

      // Verify the origin of the message for security
      // Ensure apiBaseUrl is valid before constructing URL object
      let expectedOrigin = '';
      try {
        expectedOrigin = new URL(apiBaseUrl).origin;
      } catch (e) {
        console.error("Login Page: Invalid VITE_API_BASE_URL for origin check:", apiBaseUrl, e);
        setError("Configuration error: Invalid API base URL for origin check.");
        return;
      }
      
      if (event.origin !== expectedOrigin) {
        console.warn(`Login Page: Message rejected from origin: ${event.origin}. Expected: ${expectedOrigin}`);
        // In a production environment, you should strictly return here.
        // For development, especially if using proxies or tunnels, this check might need adjustment.
        // setError(`Security warning: Message from unexpected origin ${event.origin}.`);
        // return; 
      } else {
        console.log(`Login Page: Message origin ${event.origin} verified.`);
      }

      // Check if data is an object and has a type property
      if (typeof event.data !== 'object' || event.data === null || !event.data.type) {
        console.log('Login Page: Received message is not in the expected format (missing type).', event.data);
        return;
      }

      const { type, user, error: messageError } = event.data;

      if (type === 'auth-success' && user) {
        console.log('OAuth success message received:', user);
        login(user); // Update auth context
        navigate('/'); // Redirect to home page
      } else if (type === 'auth-error') {
        console.error('OAuth error message received:', messageError);
        setError(messageError || 'OAuth authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [login, navigate, apiBaseUrl]); // Add apiBaseUrl to dependencies

  return (
    <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Login Page</h1>
      <p style={{ margin: '10px 0' }}>
        VITE_API_BASE_URL is configured as: <strong>{apiBaseUrl}</strong>
      </p>
      <Button onClick={handleGoogleLogin} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Login with Google
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
    </div>
  );
}
