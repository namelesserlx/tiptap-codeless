import react from '@vitejs/plugin-react';
import postcssDiscardComments from 'postcss-discard-comments';
import type { UserConfig } from 'vite';

/** 所有 extension 包共用的 external 列表 */
const COMMON_EXTERNALS = [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@tiptap/core',
    '@tiptap/react',
    '@tiptap/pm',
    '@tiptap/pm/state',
    '@tiptap/pm/view',
    '@tiptap/pm/model',
    '@tiptap-codeless/core',
    'classnames',
];

const COMMON_GLOBALS: Record<string, string> = {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@tiptap/core': 'TiptapCore',
    '@tiptap/react': 'TiptapReact',
    classnames: 'classNames',
};

export interface ExtensionViteConfigOptions {
    /** 库名，用于 UMD/IIFE 的 name（仅 ESM 时也保留一致） */
    name: string;
    /** 入口文件绝对路径，由调用方 resolve(__dirname, 'src/index.ts') */
    entry: string;
    /** 额外的 external 依赖（如 lowlight、mermaid），会与 COMMON_EXTERNALS 合并 */
    external?: string[];
    /** 路径别名，如 { '@': resolve(__dirname, 'src') } */
    resolveAlias?: Record<string, string>;
}

/**
 * 扩展包统一的 Vite 配置：ESM、external 依赖、CSS 去注释以减小体积、sourcemap。
 * 各 extension 包在 vite.config.ts 中调用并传入包名、entry、可选 extra external 与 alias。
 */
export function createExtensionViteConfig(options: ExtensionViteConfigOptions): UserConfig {
    const { name, entry, external: extraExternal = [], resolveAlias } = options;
    const external = [...COMMON_EXTERNALS, ...extraExternal];

    const config: UserConfig = {
        plugins: [react()],
        css: {
            postcss: {
                plugins: [
                    postcssDiscardComments({
                        removeAll: true,
                    }),
                ],
            },
        },
        build: {
            lib: {
                entry,
                name,
                formats: ['es'],
                fileName: () => 'index.mjs',
            },
            rollupOptions: {
                external,
                output: {
                    globals: COMMON_GLOBALS,
                },
            },
            cssCodeSplit: true,
            sourcemap: true,
            minify: false,
            esbuild: {
                drop: ['console', 'debugger'],
            },
        },
    };

    if (resolveAlias && Object.keys(resolveAlias).length > 0) {
        config.resolve = {
            alias: resolveAlias,
        };
    }

    return config;
}
