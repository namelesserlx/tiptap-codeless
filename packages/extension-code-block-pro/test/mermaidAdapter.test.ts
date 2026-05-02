import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderMermaidSvg, resetMermaidAdapterForTests } from '../src/runtime/mermaidAdapter';

const mermaidMock = vi.hoisted(() => ({
    initialize: vi.fn(),
    render: vi.fn(async (id: string, content: string) => ({
        svg: `<svg data-id="${id}">${content}</svg>`,
    })),
}));

vi.mock('mermaid', () => ({
    default: mermaidMock,
}));

describe('mermaidAdapter', () => {
    afterEach(() => {
        mermaidMock.initialize.mockClear();
        mermaidMock.render.mockClear();
        resetMermaidAdapterForTests();
    });

    it('loads the module once and only reinitializes when the theme changes', async () => {
        const first = await renderMermaidSvg({
            id: 'one',
            content: 'graph TD; A-->B;',
            theme: 'light',
        });
        const second = await renderMermaidSvg({
            id: 'two',
            content: 'graph TD; B-->C;',
            theme: 'light',
        });
        const third = await renderMermaidSvg({
            id: 'three',
            content: 'graph TD; C-->D;',
            theme: 'dark',
        });

        expect(first).toContain('graph TD; A-->B;');
        expect(second).toContain('graph TD; B-->C;');
        expect(third).toContain('graph TD; C-->D;');
        expect(mermaidMock.render).toHaveBeenCalledTimes(3);
        expect(mermaidMock.initialize).toHaveBeenCalledTimes(2);
        expect(mermaidMock.initialize).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ theme: 'default' })
        );
        expect(mermaidMock.initialize).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ theme: 'dark' })
        );
    });
});
