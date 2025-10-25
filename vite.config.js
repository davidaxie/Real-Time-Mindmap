import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001, // Different port from backend
    proxy: {
      '/api': 'http://localhost:3000' // Proxy API calls to backend
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
