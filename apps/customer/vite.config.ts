import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: { 
      '/api': 'http://dinesmart-api:4000',
      '/socket.io': {
        target: 'ws://dinesmart-api:4000',
        ws: true
      }
    },
  },
});
