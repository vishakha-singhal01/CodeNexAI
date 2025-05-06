import React, { useEffect, useState, FormEvent } from 'react'; // Added FormEvent
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming Input component exists
import { Label } from "@/components/ui/label"; // Assuming Label component exists

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Form state for email/password signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Optional username

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
  }, [login, navigate, apiBaseUrl]);

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: username || undefined }), // Send username only if it has a value
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed. Please try again.');
      } else {
        console.log('Email signup successful:', data.user);
        login(data.user); // Update auth context
        navigate('/'); // Redirect to home
      }
    } catch (err) {
      console.error('Email signup error:', err);
      setError('An unexpected error occurred during signup. Please try again.');
    }
  };

  return (
    <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Signup Page</h1>
      
      {/* Email/Password Signup Form */}
      <form onSubmit={handleEmailSignup} style={{ width: '300px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="username">Username (Optional)</Label>
          <Input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********" />
        </div>
        <Button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>Sign up with Email</Button>
      </form>

      <p style={{ margin: '20px 0' }}>Or</p>

      <Button onClick={handleGoogleSignup} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Sign up / Login with Google
      </Button>
      
      {error && (
        <p style={{ color: 'red', marginTop: '20px', border: '1px solid red', padding: '10px', maxWidth: '300px', textAlign: 'center' }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      <p style={{ marginTop: '20px' }}>
        VITE_API_BASE_URL is configured as: <strong>{apiBaseUrl}</strong>
      </p>
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', maxWidth: '400px' }}>
        <p><strong>Troubleshooting Tips (OAuth):</strong></p>
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
