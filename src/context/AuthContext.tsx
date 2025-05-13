import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Using axios for API calls

// Define the shape of the user object based on backend response
interface User {
  id: string;
  email?: string;
  username?: string; // Added optional username
  displayName?: string;
  googleId?: string;
  githubId?: string;
  plan: 'free' | 'pro' | 'enterprise'; // Add user's plan
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  token: string | null; // Add token to context type
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>; // Add setToken
  isLoading: boolean;
  login: (userData: User, token: string) => void; // Login now accepts a token
  logout: () => Promise<void>; // Function to handle logout API call and state update
  checkAuthStatus: () => Promise<void>; // Function to check auth status on load
}

// Create the context with a default value (can be undefined initially)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Add token state
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  // Function to check authentication status on component mount
  const checkAuthStatus = async () => {
    setIsLoading(true);
    // Attempt to load token from localStorage on initial load
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Optionally, you could verify the token with the backend here
      // For now, we'll assume if a token exists, we try to get user data
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    try {
      // Use credentials to ensure cookies are sent (for session-based parts if any)
      // And Authorization header for token-based parts
      const response = await axios.get<{ user: User | null }>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/current_user`, { withCredentials: true });
      setUser(response.data.user);
      if (!response.data.user && storedToken) {
        // If current_user returns no user but we had a token, it might be invalid/expired
        localStorage.removeItem('authToken');
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null); // Assume logged out if error
      localStorage.removeItem('authToken'); // Clear token on auth error
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user state after successful login
  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken); // Store token in localStorage
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`; // Set for subsequent axios requests
  };

  // Function to handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error logging out with API:', error);
      // Still proceed with client-side logout even if API call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken'); // Remove token from localStorage
      delete axios.defaults.headers.common['Authorization']; // Clear auth header for axios
      setIsLoading(false);
    }
  };

  // Check auth status when the provider mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // The message handling for OAuth popups is now done within LoginPage.tsx and SignupPage.tsx.
  // This useEffect is removed to prevent double handling.

  // Provide the context value to children
  const value = {
    user,
    token, // Expose token
    setUser, 
    setToken, // Expose setToken
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
