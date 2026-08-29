import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 12000,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  preview: {
    port: 12000,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
    allowedHosts: [
      'work-1-krftopeelnkinfgf.prod-runtime.all-hands.dev',
      'work-2-krftopeelnkinfgf.prod-runtime.all-hands.dev',
    ],
  },
});
