import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import type { ReactNodeViewProps } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type React from 'react';
import { CodeBlockView } from '@/components/CodeBlockView';
import {
    defaultCodeBlockProOptions,
    normalizeCodeBlockProOptions,
} from '@/config/normalizeOptions';
import { findSelectedNodeByName } from '@/extension/attrs';
import { parseLanguageAttribute, renderLanguageAttribute } from '@/extension/languageAttributes';
import type { CodeBlockProOptions } from '@/types';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        codeBlockPro: {
            /**
             * 设置代码块
             */
            setCodeBlock: (attributes?: { language?: string }) => ReturnType;

            /**
             * 切换代码块
             */
            toggleCodeBlock: (attributes?: { language?: string }) => ReturnType;

            /**
             * 更新代码块语言
             */
            updateCodeBlockLanguage: (language: string) => ReturnType;

            /**
             * 切换代码块折叠状态
             */
            toggleCodeBlockCollapse: () => ReturnType;

            /**
             * 切换行号显示
             */
            toggleCodeBlockLineNumbers: () => ReturnType;
        };
    }
}

export const CodeBlockPro = CodeBlockLowlight.extend<CodeBlockProOptions>({
    name: 'codeBlockPro',

    addOptions() {
        return {
            ...this.parent?.(),
            ...defaultCodeBlockProOptions,
        };
    },

    addAttributes() {
        const options = normalizeCodeBlockProOptions(this.options);

        return {
            ...this.parent?.(),
            language: {
                default: options.defaultLanguage,
                parseHTML: (element) => parseLanguageAttribute(element, options.defaultLanguage),
                renderHTML: (attributes) => renderLanguageAttribute(attributes.language),
            },
            collapsed: {
                default: options.collapse.defaultCollapsed ?? false,
                parseHTML: (element) => element.getAttribute('data-collapsed') === 'true',
                renderHTML: (attributes) => {
                    return {
                        'data-collapsed': attributes.collapsed,
                    };
                },
            },
            showLineNumbers: {
                default: options.lineNumbers.enabled ?? true,
                parseHTML: (element) => element.getAttribute('data-line-numbers') === 'true',
                renderHTML: (attributes) => {
                    return {
                        'data-line-numbers': attributes.showLineNumbers,
                    };
                },
            },
            showMermaidDiagram: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-show-mermaid') === 'true',
                renderHTML: (attributes) => {
                    return {
                        'data-show-mermaid': attributes.showMermaidDiagram,
                    };
                },
            },
            theme: {
                default: options.theme,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-theme'),
                renderHTML: (attributes) => {
                    return {
                        'data-theme': attributes.theme,
                    };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(
            CodeBlockView as React.ComponentType<ReactNodeViewProps<HTMLElement>>
        );
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setCodeBlock:
                (attributes) =>
                ({ editor, commands }) => {
                    if (!editor.isEditable) return false;
                    return commands.setNode(this.name, attributes);
                },
            toggleCodeBlock:
                (attributes) =>
                ({ editor, commands }) => {
                    if (!editor.isEditable) return false;
                    return commands.toggleNode(this.name, 'paragraph', attributes);
                },
            updateCodeBlockLanguage:
                (language) =>
                ({ editor, commands }) => {
                    if (!editor.isEditable) return false;
                    return commands.updateAttributes(this.name, { language });
                },
            toggleCodeBlockCollapse:
                () =>
                ({ editor, commands, state }) => {
                    if (!editor.isEditable) return false;
                    const match = findSelectedNodeByName(state.selection, this.name);

                    if (match) {
                        return commands.updateAttributes(this.name, {
                            collapsed: !match.node.attrs.collapsed,
                        });
                    }

                    return false;
                },
            toggleCodeBlockLineNumbers:
                () =>
                ({ editor, commands, state }) => {
                    if (!editor.isEditable) return false;
                    const match = findSelectedNodeByName(state.selection, this.name);

                    if (match) {
                        return commands.updateAttributes(this.name, {
                            showLineNumbers: !match.node.attrs.showLineNumbers,
                        });
                    }

                    return false;
                },
        };
    },
});

export default CodeBlockPro;
