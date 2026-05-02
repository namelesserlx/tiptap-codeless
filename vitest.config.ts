import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths({
            projects: [
                './packages/core/tsconfig.json',
                './packages/extension-code-block-pro/tsconfig.json',
                './packages/extension-drag-handle/tsconfig.json',
                './packages/extension-file-upload/tsconfig.json',
            ],
        }),
    ],
    resolve: {
        alias: [
            {
                find: 'react/jsx-dev-runtime',
                replacement: resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
            },
            {
                find: 'react/jsx-runtime',
                replacement: resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
            },
            {
                find: /^react$/,
                replacement: resolve(__dirname, 'node_modules/react/index.js'),
            },
            {
                find: /^react-dom$/,
                replacement: resolve(__dirname, 'node_modules/react-dom/index.js'),
            },
            {
                find: '@tiptap-codeless/core',
                replacement: resolve(__dirname, 'packages/core/src/index.ts'),
            },
            {
                find: '@tiptap-codeless/extension-code-block-pro',
                replacement: resolve(
                    __dirname,
                    'packages/extension-code-block-pro/src/index.ts'
                ),
            },
            {
                find: '@tiptap-codeless/extension-drag-handle',
                replacement: resolve(__dirname, 'packages/extension-drag-handle/src/index.ts'),
            },
            {
                find: '@tiptap-codeless/extension-file-upload',
                replacement: resolve(__dirname, 'packages/extension-file-upload/src/index.ts'),
            },
        ],
        dedupe: ['react', 'react-dom'],
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        include: ['packages/**/test/**/*.test.ts', 'packages/**/test/**/*.test.tsx', 'test/**/*.test.ts'],
        css: true,
        restoreMocks: true,
        clearMocks: true,
        mockReset: true,
    },
});
