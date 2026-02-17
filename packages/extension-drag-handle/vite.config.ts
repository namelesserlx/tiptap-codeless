import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createExtensionViteConfig } from '../../configs/vite-extension';

export default defineConfig(
    createExtensionViteConfig({
        name: 'TiptapDragHandle',
        entry: resolve(__dirname, 'src/index.ts'),
        resolveAlias: {
            '@': resolve(__dirname, 'src'),
        },
    })
);
