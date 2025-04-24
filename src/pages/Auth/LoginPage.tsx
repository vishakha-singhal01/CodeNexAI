import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios
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
  const { login, checkAuthStatus } = useAuth(); // Get login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true } // Send cookies
      );
      if (response.data.user) {
        login(response.data.user); // Update auth context
        navigate('/'); // Redirect to home page on successful login
      } else {
         // Should not happen if backend sends user on success, but handle defensively
          setError(response.data.message || 'Login failed. Please try again.');
       }
     } catch (err: unknown) { // Use unknown instead of any
       console.error('Login error:', err);
       let message = 'An error occurred during login.';
       // Type checking for AxiosError
       if (axios.isAxiosError(err) && err.response?.data?.message) {
         message = err.response.data.message;
       } else if (err instanceof Error) {
         // Fallback for generic Error objects
         message = err.message;
       }
       setError(message);
     } finally {
      setIsLoading(false);
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
      if (event.origin !== expectedOrigin) {
         console.warn(`Login Page: Message rejected from origin: ${event.origin}. Expected: ${expectedOrigin}`);
         // return; // Uncomment this line in production for strict origin checking
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
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
              {/* <Chrome className="mr-2 h-4 w-4" /> */}
              Login with Google
            </Button>
          </div>
          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
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
