import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createCoreViteConfig } from '../../configs/vite-core';

export default defineConfig(
    createCoreViteConfig({
        name: 'TiptapCodelessCore',
        entry: resolve(__dirname, 'src/index.ts'),
    })
);
