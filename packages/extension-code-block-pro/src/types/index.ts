/**
 * CodeBlock Pro 类型定义
 */

import type { DeepPartial, SupportedLocale } from '@tiptap-codeless/core';
import type { Editor } from '@tiptap/core';
import type { CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { CodeBlockProMessages } from '@/i18n';

/**
 * 代码块主题
 */
export type CodeBlockTheme = 'light' | 'dark' | 'auto';

/**
 * 代码块语言配置
 */
export interface LanguageConfig {
    /**
     * 语言标识符
     */
    value: string;

    /**
     * 显示名称
     */
    label: string;

    /**
     * 语言别名
     */
    aliases?: string[];
}

/**
 * 窗口控制按钮配置
 */
export interface WindowControlsConfig {
    /**
     * 是否显示关闭按钮
     */
    close?: boolean;

    /**
     * 是否显示折叠按钮
     */
    collapse?: boolean;

    /**
     * 是否显示全屏按钮
     */
    fullscreen?: boolean;

    /**
     * 关闭按钮点击回调（node 在 NodeView 外可能不可用，传 undefined）
     */
    onClose?: (node: ProseMirrorNode | undefined, pos: number) => void;

    /**
     * 全屏按钮点击回调
     */
    onFullscreen?: (node: ProseMirrorNode, pos: number) => void;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
    /**
     * 是否显示语言选择器
     */
    language?: boolean;

    /**
     * 是否显示复制按钮
     */
    copy?: boolean;

    /**
     * 是否显示行号切换按钮
     */
    lineNumbers?: boolean;
}

/**
 * 行号配置
 */
export interface LineNumbersConfig {
    /**
     * 是否默认显示行号
     */
    enabled?: boolean;

    /**
     * 起始行号
     */
    start?: number;

    /**
     * 是否可切换
     */
    allowToggle?: boolean;
}

/**
 * 折叠配置
 */
export interface CollapseConfig {
    /**
     * 是否启用折叠功能
     */
    enabled?: boolean;

    /**
     * 默认是否折叠
     */
    defaultCollapsed?: boolean;

    /**
     * 折叠时显示的行数
     */
    visibleLines?: number;
}

/**
 * 延迟渲染配置
 */
export interface RenderingConfig {
    /**
     * 是否启用延迟渲染
     * 启用后，只有当代码块进入视口时才会渲染完整内容
     */
    lazy?: boolean;

    /**
     * 提前渲染的距离（像素）
     * 例如 "100px" 表示距离视口 100px 时就开始渲染
     */
    rootMargin?: string;

    /**
     * 占位符高度（像素）
     * 在代码块未渲染时显示的占位符高度
     */
    placeholderHeight?: number;
}

/**
 * CodeBlock Pro 扩展选项
 */
export interface CodeBlockProOptions {
    /**
     * 语言环境
     * @default 'zh-CN'
     */
    locale?: SupportedLocale | string;

    /**
     * 自定义国际化文案
     */
    messages?: DeepPartial<CodeBlockProMessages>;

    /**
     * Lowlight 实例（用于语法高亮）
     */
    lowlight?: CodeBlockLowlightOptions['lowlight'];

    /**
     * 支持的语言列表
     */
    languages?: LanguageConfig[];

    /**
     * 默认语言
     */
    defaultLanguage?: string | null;

    /**
     * 主题
     */
    theme?: CodeBlockTheme;

    /**
     * 窗口控制按钮配置
     */
    windowControls?: WindowControlsConfig;

    /**
     * 工具栏配置
     */
    toolbar?: ToolbarConfig;

    /**
     * 行号配置
     */
    lineNumbers?: LineNumbersConfig;

    /**
     * 折叠配置
     */
    collapse?: CollapseConfig;

    /**
     * 延迟渲染配置
     * 用于优化大量代码块时的性能
     */
    rendering?: RenderingConfig;

    /**
     * HTML 属性
     */
    HTMLAttributes?: Record<string, unknown>;

    /**
     * UI 配置
     */
    ui?: {
        layers?: {
            languageDropdown?: number;
        };
    };
}

/**
 * 代码块节点属性
 */
export interface CodeBlockAttributes {
    /**
     * 编程语言
     */
    language?: string | null;

    /**
     * 是否折叠
     */
    collapsed?: boolean;

    /**
     * 是否显示行号
     */
    showLineNumbers?: boolean;

    /**
     * 是否显示 Mermaid 图表（仅当语言为 mermaid 时有效）
     */
    showMermaidDiagram?: boolean;

    /**
     * 主题（覆盖全局配置）
     */
    theme?: CodeBlockTheme;
}

/**
 * 复制状态
 */
export type CopyState = 'idle' | 'copying' | 'success' | 'error';

/**
 * 代码块视图属性
 */
export interface CodeBlockViewProps {
    /**
     * 节点
     */
    node: ProseMirrorNode & {
        attrs: CodeBlockAttributes;
    };

    /**
     * 更新节点属性
     */
    updateAttributes: (attrs: Partial<CodeBlockAttributes>) => void;

    /**
     * 是否选中
     */
    selected: boolean;

    /**
     * 扩展实例（含 options）
     */
    extension: { name: string; options: CodeBlockProOptions };

    /**
     * 编辑器实例
     */
    editor?: Pick<Editor, 'isEditable' | 'view' | 'on' | 'off'>;

    /**
     * 删除节点
     */
    deleteNode?: () => void;

    /**
     * 节点位置
     */
    getPos: () => number;
}
