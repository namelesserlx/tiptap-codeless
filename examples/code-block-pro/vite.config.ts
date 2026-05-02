import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/tiptap-codeless/code-block-pro/',
  server: {
    port: 5173,
  },
});
