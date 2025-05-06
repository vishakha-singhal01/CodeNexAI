import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Using axios for API calls

// Define the shape of the user object based on backend response
interface User {
  id: string;
  email?: string;
  displayName?: string;
  googleId?: string;
  githubId?: string;
  plan: 'free' | 'pro' | 'enterprise'; // Add user's plan
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (userData: User) => void; // Function to update user state on login
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
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  // Function to check authentication status on component mount
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Use credentials to ensure cookies are sent
      const response = await axios.get<{ user: User | null }>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/current_user`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null); // Assume logged out if error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user state after successful login
  const login = (userData: User) => {
    setUser(userData);
  };

  // Function to handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error (e.g., show a message)
    } finally {
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
    setUser, // Expose setUser if direct manipulation is needed elsewhere (use cautiously)
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
