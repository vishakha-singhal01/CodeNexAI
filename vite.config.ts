import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the deployed backend server during development
      '/api': {
        target: process.env.BACKEND_DEV_URL || process.env.BACKEND_MAIN_URL || 'https://code-whisper-docs.onrender.com', // Deployed backend server address
        changeOrigin: true, // Needed for virtual hosted sites
        // We keep the '/api' prefix in the frontend code, but the proxy forwards to the root of the target.
        // If your backend expects '/api' prefix (e.g. https://.../api/health), uncomment the rewrite rule below.
        // rewrite: (path) => path, // Keep /api prefix when forwarding
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
