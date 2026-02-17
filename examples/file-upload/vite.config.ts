import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    base: '/tiptap-codeless/examples/file-upload/',
    server: {
        port: 5174,
    },
});
