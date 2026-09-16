import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MUHIM: /api so'rovlari backendga (5000-port) yo'naltiriladi.
// Shu sababli ngrok'ni FAQAT shu portga (5173) ulash kifoya.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true, // ngrok manzillari uchun
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
