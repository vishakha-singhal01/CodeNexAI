import React from 'react' // Import React
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider" // Import ThemeProvider
import { AuthProvider } from './context/AuthContext' // Import AuthProvider
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode> {/* Wrap with StrictMode */}
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
