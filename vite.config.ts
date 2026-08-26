import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 12000,
    host: true,
  },
  preview: {
    port: 12000,
    host: true,
    allowedHosts: [
      'work-1-gtcokdlmfhaisibx.prod-runtime.all-hands.dev',
      'work-2-gtcokdlmfhaisibx.prod-runtime.all-hands.dev',
    ],
  },
});
