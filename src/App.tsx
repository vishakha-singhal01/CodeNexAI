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

    // If user is logged in and they are on a public-only page (like login/signup), redirect to home
    const publicOnlyPaths = ['/login', '/signup'];
    if (user && publicOnlyPaths.includes(location.pathname)) {
      console.log('User logged in, redirecting from public page to /');
      navigate('/', { replace: true });
    }

    // If the user just logged in via OAuth (user state changed from null to object),
    // and they are not already on the home page, redirect them there.
    // This handles the post-popup scenario specifically.
    // Note: This might cause a redirect even if they logged in via form, which is usually desired.
    if (user && location.pathname !== '/') {
       // We might want to be more specific here if redirects are needed only for OAuth
       // For now, redirecting logged-in users to '/' if they aren't there seems reasonable.
       // console.log('User logged in, redirecting to /');
       // navigate('/', { replace: true }); // Let's comment this specific part out for now, the above check handles login/signup pages
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
