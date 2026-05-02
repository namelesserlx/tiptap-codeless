import { describe, expect, it, vi } from 'vitest';
import { mapCommandRange } from '../src/runtime/commandRange';
import {
    applyTransactionMetaToPluginState,
    createInitialPluginState,
    hideHandleState,
    syncCurrentNode,
} from '../src/runtime/pluginState';
import { isPointInNodeSafeZone } from '../src/runtime/visibility';
import { shouldShowHandle } from '../src/utils/node';

describe('DragHandle runtime helpers', () => {
    it('maps insert menu command ranges through document changes', () => {
        const mapped = mapCommandRange(
            {
                from: 4,
                to: 8,
            },
            {
                map: (pos) => pos + 2,
            }
        );

        expect(mapped).toEqual({
            from: 6,
            to: 10,
        });
    });

    it('drops invalid command ranges after mapping', () => {
        const mapped = mapCommandRange(
            {
                from: 4,
                to: 8,
            },
            {
                map: () => 5,
            }
        );

        expect(mapped).toBeNull();
    });

    it('folds transaction meta into a single next-state snapshot', () => {
        const nextState = applyTransactionMetaToPluginState(createInitialPluginState(), {
            docChanged: false,
            getMeta: (key) => {
                if (key === 'lockDragHandle') {
                    return true;
                }

                if (key === 'openInsertMenu') {
                    return {
                        commandRange: {
                            from: 2,
                            to: 3,
                        },
                    };
                }

                return undefined;
            },
        });

        expect(nextState).toMatchObject({
            locked: true,
            insertMenuCommandRange: {
                from: 2,
                to: 3,
            },
        });
    });

    it('does not hide an active handle while it is locked', () => {
        const state = {
            ...createInitialPluginState(),
            locked: true,
            isVisible: true,
            currentNode: {
                node: {} as never,
                pos: 0,
                dom: {
                    getBoundingClientRect: vi.fn(() => new DOMRect()),
                } as never,
                isEmpty: false,
                rect: new DOMRect(),
            },
        };

        expect(hideHandleState(state)).toBe(state);
    });

    it('keeps the same plugin-state object when syncing an unchanged current node snapshot', () => {
        const currentNode = {
            node: {
                type: {
                    name: 'paragraph',
                },
            } as never,
            pos: 3,
            dom: document.createElement('p'),
            isEmpty: false,
            rect: new DOMRect(10, 20, 100, 30),
        };
        const state = {
            ...createInitialPluginState(),
            currentNode,
            isVisible: true,
        };

        expect(
            syncCurrentNode(state, {
                ...currentNode,
            })
        ).toBe(state);
    });

    it('keeps the handle visible while the pointer stays inside the node safe zone', () => {
        const dom = {
            getBoundingClientRect: vi.fn(() => ({
                left: 200,
                right: 400,
                top: 100,
                bottom: 160,
            })),
        };

        expect(
            isPointInNodeSafeZone(
                {
                    node: {} as never,
                    pos: 0,
                    dom: dom as never,
                    isEmpty: false,
                    rect: {} as DOMRect,
                },
                140,
                120
            )
        ).toBe(true);
        expect(
            isPointInNodeSafeZone(
                {
                    node: {} as never,
                    pos: 0,
                    dom: dom as never,
                    isEmpty: false,
                    rect: {} as DOMRect,
                },
                80,
                120
            )
        ).toBe(false);
    });

    it('prefers the cached node rect for safe-zone checks without forcing a fresh DOM read', () => {
        const getBoundingClientRect = vi.fn(() => ({
            left: 999,
            right: 1000,
            top: 999,
            bottom: 1000,
        }));

        expect(
            isPointInNodeSafeZone(
                {
                    node: {} as never,
                    pos: 0,
                    dom: {
                        getBoundingClientRect,
                    } as never,
                    isEmpty: false,
                    rect: {
                        left: 200,
                        right: 400,
                        top: 100,
                        bottom: 160,
                    } as DOMRect,
                },
                140,
                120
            )
        ).toBe(true);
        expect(getBoundingClientRect).not.toHaveBeenCalled();
    });

    it('evaluates node visibility through the canonical nodes include/exclude contract', () => {
        const paragraphNode = {
            type: {
                name: 'paragraph',
            },
        } as never;
        const codeBlockNode = {
            type: {
                name: 'codeBlock',
            },
        } as never;

        expect(
            shouldShowHandle(paragraphNode, {
                include: ['paragraph'],
                exclude: ['codeBlock'],
            })
        ).toBe(true);
        expect(
            shouldShowHandle(codeBlockNode, {
                include: ['paragraph'],
                exclude: ['codeBlock'],
            })
        ).toBe(false);
    });
});
