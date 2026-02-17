import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    base: '/tiptap-codeless/file-upload/',
    server: {
        port: 5174,
    },
});
