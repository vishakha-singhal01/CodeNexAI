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

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Added success message state

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
       const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, // Replaced URL
        { email, password, displayName }, // Include displayName
        { withCredentials: true } // Send cookies
      );
      // After signup, user is NOT logged in. Backend only sends a message.
      if (response.status === 201 && response.data.message) {
        setSuccessMessage(response.data.message); // Display success message from backend
        // Clear form fields
        setDisplayName('');
        setEmail('');
        setPassword('');
        setError(null); // Clear any previous errors
      } else {
        // Handle unexpected response structure or other success statuses if necessary
        setError(response.data.message || 'Signup process completed, but response was unexpected.');
      }
    } catch (err: unknown) { // Use unknown instead of any
      console.error('Signup error:', err);
      let message = 'An error occurred during signup.';
      // Type checking for AxiosError
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        // Fallback for generic Error objects
        message = err.message;
      }
      setError(message);
      setSuccessMessage(null); // Clear success message on error
    } finally {
      setIsLoading(false);
    }
  };

   const handleGoogleLogin = () => {
    console.log('Attempting Google login...');
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, '_blank', 'width=500,height=600,noopener,noreferrer'); // Replaced URL
  };

  const handleGitHubLogin = () => {
    console.log('Attempting GitHub login...');
     window.open(`${import.meta.env.VITE_API_BASE_URL}/api/auth/github`, '_blank', 'width=500,height=600,noopener,noreferrer'); // Replaced URL
  };

  // The useEffect hook for handling postMessage has been removed as the backend now handles redirects.
  // The AuthContext should detect the session change after the redirect.

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {successMessage ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* OAuth Buttons - Kept commented as per original */}
              {/* <div className="grid grid-cols-1 gap-6"> ... </div> */}
              {/* Separator - Kept commented as per original */}
              {/* <div className="relative"> ... </div> */}
              
              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignup} className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
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
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <p className="px-6 text-xs text-center text-muted-foreground">
            We protect your password using industry-standard hashing.
          </p>
        </>
          )}
        </CardContent>
        {!successMessage && (
          <CardFooter className="flex justify-center text-sm">
            Already have an account?&nbsp;
            <Link to="/login" className="underline">
              Log in
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
