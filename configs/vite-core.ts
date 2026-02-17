import type { UserConfig } from 'vite';

/** core 包 external 列表 */
const CORE_EXTERNALS = [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@tiptap/core',
    '@tiptap/react',
    '@tiptap/pm',
    '@tiptap/pm/state',
    '@tiptap/pm/view',
    '@tiptap/pm/model',
];

const CORE_GLOBALS: Record<string, string> = {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@tiptap/core': 'TiptapCore',
    '@tiptap/react': 'TiptapReact',
};

export interface CoreViteConfigOptions {
    /** 库名 */
    name: string;
    /** 入口文件绝对路径 */
    entry: string;
}

/**
 * core 包统一的 Vite 配置：ESM + CJS 双格式、external 依赖、sourcemap。
 */
export function createCoreViteConfig(options: CoreViteConfigOptions): UserConfig {
    const { name, entry } = options;

    return {
        build: {
            lib: {
                entry,
                name,
                formats: ['es', 'cjs'],
                fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
            },
            rollupOptions: {
                external: CORE_EXTERNALS,
                output: {
                    globals: CORE_GLOBALS,
                },
            },
            sourcemap: true,
            minify: false,
            esbuild: {
                drop: ['console', 'debugger'],
            },
        },
    };
}
