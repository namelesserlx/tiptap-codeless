import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/tiptap-codeless/code-block-pro/',
    server: {
        port: 3000,
    },
});
