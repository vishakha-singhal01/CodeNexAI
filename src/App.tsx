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
import { ForgotPasswordPage } from "./pages/Auth/ForgotPasswordPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"; // Import Privacy Policy Page
import TermsOfServicePage from "./pages/TermsOfServicePage"; // Import Terms of Service Page
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage"; // Import VerifyEmailPage

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
    // Define protected paths that require authentication.
    // For now, let's assume all paths other than publicOnlyPaths and static info pages are protected.
    // This example doesn't explicitly list all protected paths but demonstrates the logic.
    // A more robust solution might involve a configuration for protected routes.

    if (user) {
      // User is logged in.
      // Check if there's a 'from' location in the state (e.g., redirected from a protected route).
      const fromPath = location.state?.from?.pathname;
      const fromSearch = location.state?.from?.search;

      if (fromPath) {
        console.log(`User logged in, redirecting to originally requested path: ${fromPath}${fromSearch || ''}`);
        // Navigate to the original path and clear the state to prevent redirect loops.
        navigate(fromPath + (fromSearch || ''), { replace: true, state: {} });
      } else if (publicOnlyPaths.includes(location.pathname)) {
        // If logged in and on a public-only page like /login or /signup (and no specific 'from' path),
        // redirect to the home page.
        console.log('User logged in, on public-only page (no specific "from" path), redirecting to /');
        navigate('/', { replace: true });
      }
      // If the user is logged in, not on a public-only page, and there's no 'from' path,
      // they are likely on a valid page (e.g., /, /contact, /settings). No redirect needed.

    } else {
      // User is NOT logged in.
      // If user tries to access a protected route, redirect to login and pass the current location.
      // For this example, let's consider any page not explicitly public or informational as protected.
      // This is a simplified check.
      const informationalPages = ['/', '/contact', '/security', '/privacy', '/terms', '/forgot-password']; // Add root as informational for non-logged-in users
      const isPublicOrInfo = publicOnlyPaths.includes(location.pathname) || informationalPages.includes(location.pathname);

      if (!isPublicOrInfo) {
        console.log(`User not logged in, attempting to access ${location.pathname}, redirecting to /login`);
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
  }, [user, isLoading, navigate, location]);

  // This component doesn't render anything itself, it just handles effects
  return null;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* AuthProvider is now only in main.tsx */}
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
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} /> {/* Add Verify Email Route */}
           <Route
              path="/forgot-password"
              element={
                <div className="flex items-center justify-center min-h-screen bg-background">
                  <ForgotPasswordPage />
                </div>
              }
            />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
