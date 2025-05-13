import React, { useState, useEffect, useRef } from 'react'; // Import useEffect, useRef
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate, useLocation
import axios from 'axios';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Import icons if you have them, e.g., from lucide-react
// import { Chrome, Github } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation(); // Get location to access query params
  const { login } = useAuth(); // Get login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVSCodeAuthFlow, setIsVSCodeAuthFlow] = useState(false);
  const vscodeRedirectUri = useRef<string | null>(null);

  useEffect(() => {
    // Check for VS Code redirect_uri on component mount
    const queryParams = new URLSearchParams(location.search);
    const redirectUriFromQuery = queryParams.get('redirect_uri');
    if (redirectUriFromQuery && redirectUriFromQuery.startsWith('vscode://')) {
      setIsVSCodeAuthFlow(true);
      vscodeRedirectUri.current = redirectUriFromQuery;
      // Optionally, display a message to the user indicating this is a VS Code login
      console.log('VS Code authentication flow detected. Redirect URI:', redirectUriFromQuery);
    }
  }, [location.search]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isVSCodeAuthFlow && vscodeRedirectUri.current) {
      // VS Code specific login flow
      try {
        // The form submission itself will be handled by browser navigation due to backend redirect
        // We are POSTing to the backend, which will then redirect the browser to vscode://
        // So, no direct 'response' handling here like in the standard web flow.
        
        // Create a hidden form and submit it programmatically to ensure proper POST
        // and to let the browser handle the redirect from the backend.
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${import.meta.env.VITE_API_BASE_URL}/api/auth/vscode-login`;

        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'email';
        emailInput.value = email;
        form.appendChild(emailInput);

        const passwordInput = document.createElement('input');
        passwordInput.type = 'hidden';
        passwordInput.name = 'password';
        passwordInput.value = password;
        form.appendChild(passwordInput);

        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = 'redirect_uri';
        redirectInput.value = vscodeRedirectUri.current;
        form.appendChild(redirectInput);

        document.body.appendChild(form);
        setError('Attempting to log in via VS Code. Please wait for redirection...'); // Inform user
        form.submit();
        // setIsLoading(false); // Might not be reached if submit navigates away quickly
        // No navigation or login context update here, as VS Code will handle it via URI callback
      } catch (err) { // This catch might not be very effective if form.submit() navigates away
        console.error('VS Code Login submission error:', err);
        let message = 'An error occurred while preparing VS Code login.';
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        setIsLoading(false);
      }
    } else {
      // Standard web login flow
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
          { email, password },
          { withCredentials: true } // Send cookies for web session
        );
        // Ensure response.data, response.data.user, and response.data.token exist
        if (response.data && response.data.user && response.data.token) {
          login(response.data.user, response.data.token); // Update auth context with user and token
          navigate('/'); // Redirect to home page on successful login
        } else {
          // Handle cases where user or token might be missing, or a different message structure
          setError(response.data.message || 'Login failed. Unexpected response from server.');
        }
      } catch (err: unknown) {
        console.error('Standard Login error:', err);
        let message = 'An error occurred during login.';
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    console.log('Attempting Google login...');
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, '_blank', 'width=500,height=600,noopener,noreferrer');
  };

  const handleGitHubLogin = () => {
    console.log('Attempting GitHub login...');
     window.open(`${import.meta.env.VITE_API_BASE_URL}/api/auth/github`, '_blank', 'width=500,height=600,noopener,noreferrer');
  };

  // Effect to listen for messages from the OAuth popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Login Page: Message received:', event.data); // Log all received messages

      // IMPORTANT: Verify the origin of the message for security.
      // The message should come from your backend API origin where the callback script is served.
      const backendApiOrigin = import.meta.env.VITE_API_BASE_URL;
      if (!backendApiOrigin) {
          console.error("Login Page: VITE_API_BASE_URL is not defined. Cannot verify message origin.");
          return;
      }

      const expectedOrigin = new URL(backendApiOrigin).origin;
      // Allow messages from the current window's origin for direct navigation scenarios (e.g. VSCode redirect)
      // In a production environment, you might want to be more restrictive or handle origins differently.
      if (event.origin !== expectedOrigin && event.origin !== window.location.origin) {
         console.warn(`Login Page: Message rejected from origin: ${event.origin}. Expected: ${expectedOrigin} or ${window.location.origin}`);
         // return; // Uncomment this line in production for strict origin checking if window.location.origin is not needed
      } else {
         console.log(`Login Page: Message origin ${event.origin} verified.`);
      }

      // Check if data is an object and has a type property
      if (typeof event.data !== 'object' || event.data === null || !event.data.type) {
          console.log('Login Page: Received message is not in the expected format (missing type).', event.data);
          return;
      }

      const { type, user, token: oauthToken, error: messageError } = event.data; // Expect token for OAuth as well

      if (type === 'auth-success' && user && oauthToken) {
        console.log('OAuth success message received:', user, oauthToken);
        login(user, oauthToken); // Update auth context with user and token
        navigate('/'); // Redirect to home page
      } else if (type === 'auth-success' && user && !oauthToken) {
        // This case might occur if an OAuth flow doesn't yet return a token directly via postMessage
        // For now, we'll log a warning. Ideally, all auth flows should provide a token.
        console.warn('OAuth success message received, but no token provided. User:', user);
        // login(user); // Old behavior: login without token
        setError('OAuth login succeeded but token was not provided. Some features might not work.');
        // navigate('/'); // Still navigate, but with a warning
      }
      else if (type === 'auth-error') {
        console.error('OAuth error message received:', messageError);
        setError(messageError || 'OAuth authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [login, navigate]); // Dependencies for the effect

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 gap-6">
            {/* <Button variant="outline" onClick={handleGitHubLogin} disabled={isLoading}> */}
              {/* <Github className="mr-2 h-4 w-4" /> */}
              {/* GitHub
            </Button> */}
            {/* <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}> */}
              {/* <Chrome className="mr-2 h-4 w-4" /> */}
              {/* Login with Google
            </Button> */}
          </div>
          {/* Separator */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div> */}
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
           </form>
           <p className="px-6 text-xs text-center text-muted-foreground">
             We protect your password using industry-standard hashing.
           </p>
         </CardContent>
          <CardFooter className="flex justify-center text-sm">
             Don't have an account?&nbsp; {/* Use non-breaking space */}
             <Link to="/signup" className="underline">
                 Sign up
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
