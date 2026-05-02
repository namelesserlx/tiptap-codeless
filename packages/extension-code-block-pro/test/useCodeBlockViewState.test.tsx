import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCodeBlockViewState } from '../src/hooks/useCodeBlockViewState';
import type { CodeBlockViewProps } from '../src/types';

function createProps(): CodeBlockViewProps {
    return {
        node: {
            attrs: {
                language: 'typescript',
                collapsed: false,
                showLineNumbers: true,
                showMermaidDiagram: false,
                theme: 'auto',
            },
            textContent: 'const answer = 42;',
        } as CodeBlockViewProps['node'],
        updateAttributes: vi.fn(),
        selected: false,
        extension: {
            name: 'codeBlockPro',
            options: {
                locale: 'en',
                rendering: {
                    lazy: false,
                    rootMargin: '100px',
                    placeholderHeight: 120,
                },
            },
        },
        editor: {
            isEditable: true,
        } as never,
        deleteNode: vi.fn(),
        getPos: () => 1,
    };
}

describe('useCodeBlockViewState', () => {
    it('uses the ProseMirror node text content as the source of truth for code text', () => {
        const { result } = renderHook(() => useCodeBlockViewState(createProps()));

        expect(result.current.configValue.getCodeContent()).toBe('const answer = 42;');
    });

    it('does not mutate node attributes or delete the node in readonly mode', async () => {
        const props = createProps();
        props.node.attrs.language = 'mermaid';
        props.editor = { isEditable: false } as never;
        const { result } = renderHook(() => useCodeBlockViewState(props));

        await act(async () => {
            result.current.configValue.changeLanguage('json');
            result.current.configValue.updateAttributes({ theme: 'dark' });
            result.current.configValue.deleteNode?.();
            result.current.stateValue.toggleCollapse();
            result.current.stateValue.toggleLineNumbers();
            result.current.configValue.toggleMermaidDiagram();
        });

        expect(result.current.configValue.isEditable).toBe(false);
        expect(result.current.stateValue.isCollapsed).toBe(true);
        expect(result.current.stateValue.showLineNumbers).toBe(false);
        expect(result.current.configValue.showMermaidDiagram).toBe(true);
        expect(result.current.mermaidValue.isShowingMermaidDiagram).toBe(true);
        expect(props.updateAttributes).not.toHaveBeenCalled();
        expect(props.deleteNode).not.toHaveBeenCalled();
    });
});
