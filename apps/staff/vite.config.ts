import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    watch: {
      ignored: ['**/.git/**'],
    },
    proxy: { 
      '/api': 'http://api:4000',
      '/socket.io': {
        target: 'ws://api:4000',
        ws: true
      }
    },
  },
});
