import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import type { ReactNodeViewProps } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type React from 'react';
import { CodeBlockView } from '@/components/CodeBlockView';
import type { CodeBlockProOptions, LanguageConfig } from '@/types';
// 默认语言配置
const defaultLanguages: LanguageConfig[] = [
    { value: 'javascript', label: 'JavaScript', aliases: ['js'] },
    { value: 'typescript', label: 'TypeScript', aliases: ['ts'] },
    { value: 'python', label: 'Python', aliases: ['py'] },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++', aliases: ['c++'] },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#', aliases: ['cs'] },
    { value: 'go', label: 'Go', aliases: ['golang'] },
    { value: 'rust', label: 'Rust', aliases: ['rs'] },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby', aliases: ['rb'] },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin', aliases: ['kt'] },
    { value: 'html', label: 'HTML', aliases: ['xml'] },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS', aliases: ['sass'] },
    { value: 'less', label: 'Less' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML', aliases: ['yml'] },
    { value: 'markdown', label: 'Markdown', aliases: ['md'] },
    { value: 'bash', label: 'Bash', aliases: ['sh', 'shell'] },
    { value: 'sql', label: 'SQL' },
    { value: 'graphql', label: 'GraphQL', aliases: ['gql'] },
    { value: 'dockerfile', label: 'Dockerfile', aliases: ['docker'] },
    { value: 'mermaid', label: 'Mermaid', aliases: ['mmd', 'mid'] },
];

const defaultOptions: CodeBlockProOptions = {
    languages: defaultLanguages,
    defaultLanguage: null,
    theme: 'auto',
    macosControls: {
        showClose: true,
        showCollapse: true,
        showFullscreen: true,
    },
    toolbar: {
        showLanguageSelector: true,
        showCopyButton: true,
        showLineNumbersToggle: true,
    },
    lineNumbers: {
        enabled: true,
        startLine: 1,
        toggleable: true,
    },
    collapse: {
        enabled: true,
        defaultCollapsed: false,
        collapsedLines: 3,
    },
    lazyRender: {
        enabled: false, // 默认禁用，用户按需启用
        rootMargin: '100px', // 提前 100px 开始渲染
        placeholderHeight: 100, // 占位符高度
    },
    HTMLAttributes: {
        class: 'code-block-pro',
    },
};

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
        return defaultOptions;
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            language: {
                default: this.options.defaultLanguage,
                parseHTML: (element) => {
                    // 优先从 data-language 属性读取
                    const dataLanguage = element.getAttribute('data-language');
                    if (dataLanguage) {
                        return dataLanguage;
                    }

                    // 从 class 属性中提取语言（支持 language-* 格式）
                    const classList = element.className || '';
                    const languageMatch = classList.match(/language-(\w+)/);
                    if (languageMatch) {
                        return languageMatch[1];
                    }

                    // 从子元素 <code> 的 class 中提取语言
                    const codeElement = element.querySelector('code');
                    if (codeElement) {
                        const codeClassList = codeElement.className || '';
                        const codeLanguageMatch = codeClassList.match(/language-(\w+)/);
                        if (codeLanguageMatch) {
                            return codeLanguageMatch[1];
                        }
                    }

                    return this.options.defaultLanguage;
                },
                renderHTML: (attributes) => {
                    if (!attributes.language) {
                        return {};
                    }
                    return {
                        'data-language': attributes.language,
                        class: `language-${attributes.language}`,
                    };
                },
            },
            collapsed: {
                default: this.options.collapse?.defaultCollapsed ?? false,
                parseHTML: (element) => element.getAttribute('data-collapsed') === 'true',
                renderHTML: (attributes) => {
                    return {
                        'data-collapsed': attributes.collapsed,
                    };
                },
            },
            showLineNumbers: {
                default: this.options.lineNumbers?.enabled ?? true,
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
                default: this.options.theme,
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
                ({ commands }) => {
                    return commands.setNode(this.name, attributes);
                },
            toggleCodeBlock:
                (attributes) =>
                ({ commands }) => {
                    return commands.toggleNode(this.name, 'paragraph', attributes);
                },
            updateCodeBlockLanguage:
                (language) =>
                ({ commands }) => {
                    return commands.updateAttributes(this.name, { language });
                },
            toggleCodeBlockCollapse:
                () =>
                ({ commands, state }) => {
                    const { selection } = state;
                    const node = state.doc.nodeAt(selection.from);

                    if (node?.type.name === this.name) {
                        return commands.updateAttributes(this.name, {
                            collapsed: !node.attrs.collapsed,
                        });
                    }

                    return false;
                },
            toggleCodeBlockLineNumbers:
                () =>
                ({ commands, state }) => {
                    const { selection } = state;
                    const node = state.doc.nodeAt(selection.from);

                    if (node?.type.name === this.name) {
                        return commands.updateAttributes(this.name, {
                            showLineNumbers: !node.attrs.showLineNumbers,
                        });
                    }

                    return false;
                },
        };
    },
});

export default CodeBlockPro;
