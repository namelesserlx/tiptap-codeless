import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNodeInfoFromCoords } from '../src/utils/node';

describe('DragHandle node lookup cache', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
    });

    it('reuses the resolved outer-node mapping for repeated lookups within the same document snapshot', () => {
        const editorDom = document.createElement('div');
        const outerDom = document.createElement('div');
        const innerDom = document.createElement('span');
        outerDom.appendChild(innerDom);
        editorDom.appendChild(outerDom);
        document.body.appendChild(editorDom);

        const node = {
            type: {
                name: 'paragraph',
            },
            isAtom: false,
            content: {
                size: 1,
            },
            textContent: 'cached',
        };
        const descendants = vi.fn((visitor: (node: typeof node, pos: number) => boolean | void) => {
            visitor(node, 5);
        });
        const doc = {
            resolve: vi.fn(() => ({
                depth: 1,
                node: () => node,
                before: () => 5,
            })),
            descendants,
        };
        const view = {
            dom: editorDom,
            state: {
                doc,
            },
            posAtDOM: vi.fn(() => {
                throw new Error('posAtDOM failed');
            }),
            nodeDOM: vi.fn(() => outerDom),
        };

        Object.defineProperty(document, 'elementFromPoint', {
            configurable: true,
            value: vi.fn(() => innerDom),
        });
        outerDom.getBoundingClientRect = vi.fn(() => new DOMRect(100, 120, 320, 32));

        const first = getNodeInfoFromCoords(view as never, 100, 120);
        const second = getNodeInfoFromCoords(view as never, 104, 120);

        expect(first?.pos).toBe(5);
        expect(second?.pos).toBe(5);
        expect(descendants).toHaveBeenCalledTimes(1);
    });

    it('invalidates the cached outer-node mapping when the document snapshot changes', () => {
        const editorDom = document.createElement('div');
        const outerDom = document.createElement('div');
        const innerDom = document.createElement('span');
        outerDom.appendChild(innerDom);
        editorDom.appendChild(outerDom);
        document.body.appendChild(editorDom);

        const node = {
            type: {
                name: 'paragraph',
            },
            isAtom: false,
            content: {
                size: 1,
            },
            textContent: 'cached',
        };
        const firstDoc = {
            resolve: vi.fn(() => ({
                depth: 1,
                node: () => node,
                before: () => 5,
            })),
            descendants: vi.fn((visitor: (node: typeof node, pos: number) => boolean | void) => {
                visitor(node, 5);
            }),
        };
        const secondDoc = {
            resolve: vi.fn(() => ({
                depth: 1,
                node: () => node,
                before: () => 5,
            })),
            descendants: vi.fn((visitor: (node: typeof node, pos: number) => boolean | void) => {
                visitor(node, 5);
            }),
        };
        const view = {
            dom: editorDom,
            state: {
                doc: firstDoc,
            },
            posAtDOM: vi.fn(() => {
                throw new Error('posAtDOM failed');
            }),
            nodeDOM: vi.fn(() => outerDom),
        };

        Object.defineProperty(document, 'elementFromPoint', {
            configurable: true,
            value: vi.fn(() => innerDom),
        });
        outerDom.getBoundingClientRect = vi.fn(() => new DOMRect(100, 120, 320, 32));

        getNodeInfoFromCoords(view as never, 100, 120);
        view.state.doc = secondDoc;
        getNodeInfoFromCoords(view as never, 104, 120);

        expect(firstDoc.descendants).toHaveBeenCalledTimes(1);
        expect(secondDoc.descendants).toHaveBeenCalledTimes(1);
    });
});
