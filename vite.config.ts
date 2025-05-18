import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react/jsx-runtime": path.resolve(__dirname, "./src/jsx-runtime.ts")
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['i18next-http-backend']
  },
  build: {
    commonjsOptions: {
      include: [/i18next-http-backend/, /node_modules/]
    }
  }
}));
