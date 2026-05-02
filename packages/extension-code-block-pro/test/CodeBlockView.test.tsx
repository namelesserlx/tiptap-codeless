import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockView } from '../src/components/CodeBlockView';
import type { CodeBlockViewProps } from '../src/types';

vi.mock('@tiptap/react', async () => {
    const ReactModule = await import('react');

    return {
        NodeViewWrapper: ReactModule.forwardRef<
            HTMLDivElement,
            ReactModule.HTMLAttributes<HTMLDivElement>
        >(function MockNodeViewWrapper({ children, ...props }, ref) {
            return (
                <div ref={ref} data-node-view-wrapper="" {...props}>
                    {children}
                </div>
            );
        }),
        NodeViewContent: () => <div data-node-view-content="" />,
    };
});

let intersectionCallback: IntersectionObserverCallback | null = null;
let observedTarget: Element | null = null;

class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '100px';
    readonly thresholds = [0];

    constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
    }

    disconnect() {}

    observe(target: Element) {
        observedTarget = target;
    }

    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }

    unobserve() {}
}

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
        } as CodeBlockViewProps['node'],
        updateAttributes: vi.fn(),
        selected: false,
        extension: {
            name: 'codeBlockPro',
            options: {
                locale: 'en',
                rendering: {
                    lazy: true,
                    rootMargin: '100px',
                    placeholderHeight: 120,
                },
            },
        },
        deleteNode: vi.fn(),
        getPos: () => 1,
    };
}

describe('CodeBlockView', () => {
    beforeEach(() => {
        intersectionCallback = null;
        observedTarget = null;
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('keeps the same content mount target when lazy content becomes visible', () => {
        const { container } = render(<CodeBlockView {...createProps()} />);

        const initialWrapper = container.querySelector('.code-block-pro-wrapper');
        const initialContentTarget = container.querySelector('[data-node-view-content]');

        expect(initialWrapper).toBeTruthy();
        expect(initialContentTarget).toBeTruthy();
        expect(container.querySelector('.code-block-pro-placeholder')).toBeTruthy();
        expect(container.querySelector('.code-block-header')).toBeNull();
        expect(intersectionCallback).toBeTypeOf('function');
        expect(observedTarget).toBeTruthy();

        act(() => {
            intersectionCallback?.(
                [
                    {
                        isIntersecting: true,
                        target: observedTarget as Element,
                    } as IntersectionObserverEntry,
                ],
                {} as IntersectionObserver
            );
        });

        const nextWrapper = container.querySelector('.code-block-pro-wrapper');
        const nextContentTarget = container.querySelector('[data-node-view-content]');

        expect(nextWrapper).toBe(initialWrapper);
        expect(nextContentTarget).toBe(initialContentTarget);
        expect(container.querySelector('.code-block-pro-placeholder')).toBeNull();
        expect(container.querySelector('.code-block-header')).toBeTruthy();
        expect(container.querySelector('.code-block-body')).toBeTruthy();
    });
});
