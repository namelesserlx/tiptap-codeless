import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createExtensionViteConfig } from '../../configs/vite-extension';

export default defineConfig(
    createExtensionViteConfig({
        name: 'TiptapCodeBlockPro',
        entry: resolve(__dirname, 'src/index.ts'),
        external: ['@tiptap/extension-code-block-lowlight', 'lowlight', 'mermaid'],
        resolveAlias: {
            '@': resolve(__dirname, 'src'),
        },
    })
);
