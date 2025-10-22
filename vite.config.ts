import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    // Proxy configuration for development only
    // Proxies /api/* requests to backend server to avoid CORS
    proxy: {
      '/api': {
        target: 'http://192.168.71.112:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the path as is
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
});
