import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentNodeInfo, DragHandleOptions } from '../src/types';

const hoverRuntimeMocks = vi.hoisted(() => ({
    getNodeInfoFromCoords: vi.fn<[unknown, number, number], CurrentNodeInfo | null>(),
    getNodeInfoFromPos: vi.fn<[unknown, number], CurrentNodeInfo | null>(),
    isPointInNodeSafeZone: vi.fn(() => false),
    shouldShowHandle: vi.fn(() => true),
}));

vi.mock('../src/runtime/visibility', () => ({
    isPointInNodeSafeZone: hoverRuntimeMocks.isPointInNodeSafeZone,
}));

vi.mock('../src/utils/node', async () => {
    const actual = await vi.importActual<typeof import('../src/utils/node')>('../src/utils/node');

    return {
        ...actual,
        getNodeInfoFromCoords: hoverRuntimeMocks.getNodeInfoFromCoords,
        getNodeInfoFromPos: hoverRuntimeMocks.getNodeInfoFromPos,
        shouldShowHandle: hoverRuntimeMocks.shouldShowHandle,
    };
});

import { createDragHandlePlugin } from '../src/extension/DragHandlePlugin';

function createFakeEditor() {
    const editorDom = document.createElement('div');
    editorDom.setAttribute('contenteditable', 'true');
    document.body.appendChild(editorDom);

    return {
        isEditable: true,
        view: {
            dom: editorDom,
            state: {
                doc: {
                    eq: vi.fn(() => true),
                },
                tr: {
                    mapping: {
                        map: vi.fn((pos: number) => pos),
                    },
                },
            },
            dispatch: vi.fn(),
        },
    };
}

function getHandleDomEvents(plugin: ReturnType<typeof createDragHandlePlugin>) {
    const pluginWithInternals = plugin as ReturnType<typeof createDragHandlePlugin> & {
        props?: { handleDOMEvents?: Record<string, (...args: unknown[]) => boolean> };
        spec?: { props?: { handleDOMEvents?: Record<string, (...args: unknown[]) => boolean> } };
    };

    return pluginWithInternals.props?.handleDOMEvents ?? pluginWithInternals.spec?.props?.handleDOMEvents;
}

function createNodeInfo(pos: number): CurrentNodeInfo {
    const dom = document.createElement('p');
    dom.getBoundingClientRect = vi.fn(
        () => new DOMRect(160, 80 + pos * 24, 320, 32)
    ) as typeof dom.getBoundingClientRect;

    return {
        node: {
            type: {
                name: 'paragraph',
            },
            isAtom: false,
            content: {
                size: 1,
            },
            textContent: `node-${pos}`,
        } as never,
        pos,
        dom,
        isEmpty: false,
        rect: dom.getBoundingClientRect(),
    };
}

describe('DragHandle hover latency', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            return window.setTimeout(() => {
                callback(performance.now());
            }, 16);
        });
        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            clearTimeout(id);
        });
        hoverRuntimeMocks.getNodeInfoFromCoords.mockReset();
        hoverRuntimeMocks.getNodeInfoFromPos.mockReset();
        hoverRuntimeMocks.isPointInNodeSafeZone.mockReturnValue(false);
        hoverRuntimeMocks.shouldShowHandle.mockReturnValue(true);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('does not keep postponing the handle while the pointer keeps moving inside the same block', () => {
        const nodeInfo = createNodeInfo(1);
        hoverRuntimeMocks.getNodeInfoFromCoords.mockReturnValue(nodeInfo);
        hoverRuntimeMocks.getNodeInfoFromPos.mockReturnValue(nodeInfo);
        const onStateChange = vi.fn();
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                handle: {
                    hoverDelay: 100,
                },
            } as DragHandleOptions,
            onStateChange,
        });
        const mousemove = getHandleDomEvents(plugin)?.mousemove;

        mousemove?.(editor.view as never, { clientX: 120, clientY: 120 } as MouseEvent);
        vi.advanceTimersByTime(16);
        vi.advanceTimersByTime(60);
        mousemove?.(editor.view as never, { clientX: 124, clientY: 122 } as MouseEvent);
        vi.advanceTimersByTime(16);
        vi.advanceTimersByTime(25);

        expect(onStateChange).toHaveBeenCalledTimes(1);
        expect(onStateChange.mock.calls[0]?.[0]).toMatchObject({
            currentNode: {
                pos: 1,
            },
            isVisible: true,
        });
    });

    it('switches the handle to the latest hovered block without extra throttling lag', () => {
        const firstNode = createNodeInfo(1);
        const secondNode = createNodeInfo(2);
        let activeNode = firstNode;

        hoverRuntimeMocks.getNodeInfoFromCoords.mockImplementation(() => activeNode);
        hoverRuntimeMocks.getNodeInfoFromPos.mockImplementation(() => activeNode);
        const onStateChange = vi.fn();
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                handle: {
                    hoverDelay: 0,
                },
            } as DragHandleOptions,
            onStateChange,
        });
        const mousemove = getHandleDomEvents(plugin)?.mousemove;

        mousemove?.(editor.view as never, { clientX: 120, clientY: 120 } as MouseEvent);
        vi.advanceTimersByTime(16);
        expect(onStateChange.mock.calls[0]?.[0]).toMatchObject({
            currentNode: {
                pos: 1,
            },
            isVisible: true,
        });

        activeNode = secondNode;
        vi.advanceTimersByTime(10);
        mousemove?.(editor.view as never, { clientX: 120, clientY: 164 } as MouseEvent);
        vi.advanceTimersByTime(16);

        expect(onStateChange.mock.calls[1]?.[0]).toMatchObject({
            currentNode: {
                pos: 2,
            },
            isVisible: true,
        });
    });
});
