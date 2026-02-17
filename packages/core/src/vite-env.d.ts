/// <reference types="vite/client" />

/**
 * Vite CSS inline 导入类型声明
 * 使用 ?inline 后缀导入 CSS 时返回字符串
 */
declare module '*.css?inline' {
    const css: string;
    export default css;
}

declare module '*.scss?inline' {
    const css: string;
    export default css;
}

declare module '*.less?inline' {
    const css: string;
    export default css;
}
