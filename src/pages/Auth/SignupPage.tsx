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
       if (response.data.user) {
        login(response.data.user); // Update auth context after signup
        navigate('/'); // Redirect to home page on successful signup
      } else {
         // Handle case where backend doesn't send user on success (shouldn't happen)
          setError(response.data.message || 'Signup failed. Please try again.');
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
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
             </Button>
           </form>
           <p className="px-6 text-xs text-center text-muted-foreground">
             We protect your password using industry-standard hashing.
           </p>
         </CardContent>
          <CardFooter className="flex justify-center text-sm">
             Already have an account?&nbsp;
             <Link to="/login" className="underline">
                Log in
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
