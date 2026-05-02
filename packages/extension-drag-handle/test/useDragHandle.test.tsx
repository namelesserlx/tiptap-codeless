import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dragHandlePluginKey } from '../src/extension/DragHandlePlugin';
import { useDragHandle } from '../src/hooks/useDragHandle';
import type { DragHandlePluginState } from '../src/types';

type EditorListener = (...args: unknown[]) => void;

function createFakeEditor() {
    const listeners = new Map<string, Set<EditorListener>>();

    return {
        state: {},
        view: {
            state: {
                tr: {
                    setMeta: vi.fn(() => ({})),
                },
            },
            dispatch: vi.fn(),
        },
        on: vi.fn((event: string, handler: EditorListener) => {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }

            listeners.get(event)?.add(handler);
        }),
        off: vi.fn((event: string, handler: EditorListener) => {
            listeners.get(event)?.delete(handler);
        }),
        emit(event: string, ...args: unknown[]) {
            listeners.get(event)?.forEach((handler) => handler(...args));
        },
    };
}

describe('useDragHandle', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('skips rerenders when transaction snapshots are structurally unchanged', () => {
        const editor = createFakeEditor();
        let currentPluginState: DragHandlePluginState = {
            locked: false,
            currentNode: null,
            isDragging: false,
            isVisible: false,
            insertMenuCommandRange: null,
        };
        const getStateSpy = vi
            .spyOn(dragHandlePluginKey, 'getState')
            .mockImplementation(() => currentPluginState);

        let renderCount = 0;
        const { result } = renderHook(() => {
            renderCount += 1;
            return useDragHandle(editor as never);
        });

        expect(getStateSpy).toHaveBeenCalled();
        expect(renderCount).toBe(1);
        expect(result.current.visible).toBe(false);

        currentPluginState = {
            locked: false,
            currentNode: null,
            isDragging: false,
            isVisible: false,
            insertMenuCommandRange: null,
        };

        act(() => {
            editor.emit('transaction');
        });

        expect(renderCount).toBe(1);

        currentPluginState = {
            locked: false,
            currentNode: {
                node: {
                    type: {
                        name: 'paragraph',
                    },
                } as never,
                pos: 1,
                dom: document.createElement('p'),
                isEmpty: false,
                rect: new DOMRect(100, 120, 320, 32),
            },
            isDragging: false,
            isVisible: true,
            insertMenuCommandRange: null,
        };

        act(() => {
            editor.emit('transaction');
        });

        expect(renderCount).toBe(2);
        expect(result.current.visible).toBe(true);
        expect(result.current.nodeInfo?.pos).toBe(1);
    });
});
