import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['lodash']
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://recipe-finder-backend-idhn.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
