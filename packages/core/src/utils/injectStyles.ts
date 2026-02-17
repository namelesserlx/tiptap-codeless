/**
 * 样式注入工具
 * 用于在运行时自动将 CSS 注入到 DOM 中
 */

// 已注入样式的 ID 集合，避免重复注入
const injectedStyles = new Set<string>();

export interface InjectStylesOptions {
    /** 样式的唯一标识符 */
    id: string;
    /** CSS 样式内容 */
    css: string;
    /** 是否在 head 开头插入（默认追加到末尾） */
    prepend?: boolean;
}

/**
 * 将 CSS 样式注入到 document.head 中
 *
 * @param options - 注入选项
 * @returns 是否成功注入（如果已存在则返回 false）
 *
 * @example
 * ```ts
 * import css from './styles/index.css?inline';
 * import { injectStyles } from '@tiptap-codeless/core';
 *
 * injectStyles({
 *   id: 'tiptap-file-upload',
 *   css,
 * });
 * ```
 */
export function injectStyles(options: InjectStylesOptions): boolean {
    const { id, css, prepend = false } = options;

    // 检查是否已注入
    if (injectedStyles.has(id)) {
        return false;
    }

    // 检查 DOM 中是否已存在该样式（可能来自 SSR 或其他来源）
    if (typeof document !== 'undefined' && document.getElementById(id)) {
        injectedStyles.add(id);
        return false;
    }

    // 在浏览器环境中注入样式
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = id;
        // CSS 注释已在构建时通过 PostCSS 插件移除
        style.textContent = css;

        if (prepend && document.head.firstChild) {
            document.head.insertBefore(style, document.head.firstChild);
        } else {
            document.head.appendChild(style);
        }

        injectedStyles.add(id);
        return true;
    }

    return false;
}
