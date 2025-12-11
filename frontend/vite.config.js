import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  publicDir: 'public',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          particles: ['@tsparticles/react', '@tsparticles/slim']
        }
      }
    }
  }
});

