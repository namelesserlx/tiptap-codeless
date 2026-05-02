import { mergeUiConfig } from '@tiptap-codeless/core';
import type { CodeBlockProOptions, LanguageConfig } from '@/types';

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

export const defaultCodeBlockProOptions: CodeBlockProOptions = {
    locale: 'zh-CN',
    messages: {},
    languages: defaultLanguages,
    defaultLanguage: null,
    theme: 'auto',
    windowControls: {
        close: true,
        collapse: true,
        fullscreen: true,
    },
    toolbar: {
        language: true,
        copy: true,
        lineNumbers: true,
    },
    lineNumbers: {
        enabled: true,
        start: 1,
        allowToggle: true,
    },
    collapse: {
        enabled: true,
        defaultCollapsed: false,
        visibleLines: 3,
    },
    rendering: {
        lazy: false,
        rootMargin: '100px',
        placeholderHeight: 100,
    },
    HTMLAttributes: {
        class: 'code-block-pro',
    },
    ui: {
        layers: {
            languageDropdown: 1000,
        },
    },
};

export interface NormalizedCodeBlockProOptions extends CodeBlockProOptions {
    locale: string;
    messages: NonNullable<CodeBlockProOptions['messages']>;
    languages: LanguageConfig[];
    theme: NonNullable<CodeBlockProOptions['theme']>;
    toolbar: NonNullable<CodeBlockProOptions['toolbar']>;
    lineNumbers: NonNullable<CodeBlockProOptions['lineNumbers']>;
    collapse: NonNullable<CodeBlockProOptions['collapse']>;
    rendering: NonNullable<CodeBlockProOptions['rendering']>;
    windowControls: NonNullable<CodeBlockProOptions['windowControls']>;
    HTMLAttributes: NonNullable<CodeBlockProOptions['HTMLAttributes']>;
    ui: {
        layers: {
            languageDropdown: number;
        };
    };
}

export function normalizeCodeBlockProOptions(
    options: CodeBlockProOptions = {}
): NormalizedCodeBlockProOptions {
    return {
        ...defaultCodeBlockProOptions,
        ...options,
        locale: options.locale ?? defaultCodeBlockProOptions.locale ?? 'zh-CN',
        messages: options.messages ?? defaultCodeBlockProOptions.messages ?? {},
        languages: options.languages ?? defaultCodeBlockProOptions.languages ?? defaultLanguages,
        defaultLanguage:
            options.defaultLanguage ?? defaultCodeBlockProOptions.defaultLanguage ?? null,
        theme: options.theme ?? defaultCodeBlockProOptions.theme ?? 'auto',
        windowControls: {
            ...defaultCodeBlockProOptions.windowControls,
            ...options.windowControls,
        },
        toolbar: {
            ...defaultCodeBlockProOptions.toolbar,
            ...options.toolbar,
        },
        lineNumbers: {
            ...defaultCodeBlockProOptions.lineNumbers,
            ...options.lineNumbers,
        },
        collapse: {
            ...defaultCodeBlockProOptions.collapse,
            ...options.collapse,
        },
        rendering: {
            ...defaultCodeBlockProOptions.rendering,
            ...options.rendering,
        },
        HTMLAttributes: mergeUiConfig(
            defaultCodeBlockProOptions.HTMLAttributes,
            options.HTMLAttributes
        ),
        ui: {
            layers: {
                languageDropdown:
                    options.ui?.layers?.languageDropdown ??
                    defaultCodeBlockProOptions.ui?.layers?.languageDropdown ??
                    1000,
            },
        },
    };
}
