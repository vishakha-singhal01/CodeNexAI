import React, { useEffect } from 'react'; // Import React and useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"; // Import useNavigate, useLocation
import { useAuth } from './context/AuthContext'; // Import useAuth
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/Auth/LoginPage"; // Import LoginPage
import { SignupPage } from "./pages/Auth/SignupPage"; // Import SignupPage
import ContactPage from "./pages/ContactPage"; // Import ContactPage
import SecurityPage from "./pages/SecurityPage"; // Import SecurityPage
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"; // Import Privacy Policy Page
import TermsOfServicePage from "./pages/TermsOfServicePage"; // Import Terms of Service Page

const queryClient = new QueryClient();

// Component to handle redirection logic based on auth state
const AuthRedirector = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect until initial auth check is complete
    if (isLoading) {
      return;
    }

    const publicOnlyPaths = ['/login', '/signup'];

    if (user) {
      // If user is logged in and on a public-only page, redirect to home
      if (publicOnlyPaths.includes(location.pathname)) {
        console.log('User logged in, redirecting from public-only page to /');
        navigate('/', { replace: true });
      }
      // Else if user is logged in, not on a public-only page, and not on home, redirect to home
      // This handles post-login/signup redirection (including OAuth)
      else if (location.pathname !== '/') {
        console.log('User logged in (and not on a public-only page or home), redirecting to /');
        navigate('/', { replace: true });
      }
    }
    // If user is NOT logged in and tries to access a protected route, redirect to login
    // Example: Add protected routes logic here if needed in the future
    // const protectedPaths = ['/dashboard', '/profile'];
    // if (!user && protectedPaths.includes(location.pathname)) {
    //   navigate('/login', { replace: true, state: { from: location } });
    // }

  }, [user, isLoading, navigate, location]);

  // This component doesn't render anything itself, it just handles effects
  return null;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthRedirector /> {/* Add the redirector component */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} /> {/* Add Login Route */}
          <Route path="/signup" element={<SignupPage />} /> {/* Add Signup Route */}
          <Route path="/contact" element={<ContactPage />} /> {/* Add Contact Route */}
          <Route path="/security" element={<SecurityPage />} /> {/* Add Security Route */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* Add Privacy Policy Route */}
          <Route path="/terms" element={<TermsOfServicePage />} /> {/* Add Terms of Service Route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
