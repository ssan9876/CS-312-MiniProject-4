import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React app runs on http://localhost:5173 and forwards
// every /api request to the Express backend on port 8000. Because the browser
// only ever talks to one origin, the session cookie works without CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
