import { createTestEditor } from '@tiptap-codeless/core';
import { common, createLowlight } from 'lowlight';
import { describe, expect, it } from 'vitest';
import { CodeBlockPro } from '../src/extension/CodeBlockProExtension';
import { parseLanguageAttribute, renderLanguageAttribute } from '../src/extension/languageAttributes';

const lowlight = createLowlight(common);

describe('CodeBlockPro options', () => {
    it('preserves the parent CodeBlockLowlight defaults when configured', () => {
        const extension = CodeBlockPro.configure({});

        expect(extension.options.languageClassPrefix).toBe('language-');
        expect(extension.options.exitOnTripleEnter).toBe(true);
        expect(extension.options.exitOnArrowDown).toBe(true);
        expect(extension.options.enableTabIndentation).toBe(false);
    });

    it('round-trips language ids with special characters through HTML attributes', () => {
        const rendered = renderLanguageAttribute('objective-c++#');
        const element = document.createElement('pre');

        Object.entries(rendered ?? {}).forEach(([key, value]) => {
            element.setAttribute(key, String(value));
        });

        expect(parseLanguageAttribute(element)).toBe('objective-c++#');
        expect(rendered).toEqual({
            'data-language': 'objective-c++#',
            class: 'language-objective-c++#',
        });
    });

    it('parses language ids with special characters from class names on pre/code elements', () => {
        const preElement = document.createElement('pre');
        preElement.className = 'code-block language-c++ extra-class';
        expect(parseLanguageAttribute(preElement)).toBe('c++');

        const nestedElement = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.className = 'hljs language-c#';
        nestedElement.append(codeElement);
        expect(parseLanguageAttribute(nestedElement)).toBe('c#');
    });

    it('toggles collapsed and line number attrs while the selection is inside the code block text', () => {
        const editor = createTestEditor({
            extensions: [
                CodeBlockPro.configure({
                    lowlight,
                }),
            ],
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'codeBlockPro',
                        attrs: {
                            language: 'typescript',
                            collapsed: false,
                            showLineNumbers: true,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'const answer = 42;',
                            },
                        ],
                    },
                ],
            },
        });

        editor.commands.setTextSelection(3);

        expect(editor.commands.toggleCodeBlockCollapse()).toBe(true);
        expect(editor.commands.toggleCodeBlockLineNumbers()).toBe(true);

        const codeBlockNode = editor.state.doc.firstChild;

        expect(codeBlockNode?.attrs.collapsed).toBe(true);
        expect(codeBlockNode?.attrs.showLineNumbers).toBe(false);

        editor.destroy();
    });

    it('does not mutate code block attrs through commands in readonly mode', () => {
        const editor = createTestEditor({
            extensions: [
                CodeBlockPro.configure({
                    lowlight,
                }),
            ],
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'codeBlockPro',
                        attrs: {
                            language: 'typescript',
                            collapsed: false,
                            showLineNumbers: true,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'const answer = 42;',
                            },
                        ],
                    },
                ],
            },
        });

        editor.commands.setTextSelection(3);
        editor.setEditable(false);

        expect(editor.commands.updateCodeBlockLanguage('json')).toBe(false);
        expect(editor.commands.toggleCodeBlockCollapse()).toBe(false);
        expect(editor.commands.toggleCodeBlockLineNumbers()).toBe(false);

        const codeBlockNode = editor.state.doc.firstChild;
        expect(codeBlockNode?.attrs.language).toBe('typescript');
        expect(codeBlockNode?.attrs.collapsed).toBe(false);
        expect(codeBlockNode?.attrs.showLineNumbers).toBe(true);

        editor.destroy();
    });
});
