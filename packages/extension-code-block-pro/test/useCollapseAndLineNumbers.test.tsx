import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCollapse } from '../src/hooks/useCollapse';
import { useLineNumbers } from '../src/hooks/useLineNumbers';

describe('useCollapse', () => {
    it('resyncs the collapsed UI state when node attrs change externally', () => {
        const onCollapsedChange = vi.fn();
        const { result, rerender } = renderHook(
            ({ collapsed }) =>
                useCollapse({
                    defaultCollapsed: collapsed,
                    collapsedLines: 3,
                    onCollapsedChange,
                }),
            {
                initialProps: {
                    collapsed: false,
                },
            }
        );

        expect(result.current.isCollapsed).toBe(false);

        rerender({ collapsed: true });
        expect(result.current.isCollapsed).toBe(true);

        act(() => {
            result.current.toggle();
        });

        expect(result.current.isCollapsed).toBe(false);
        expect(onCollapsedChange).toHaveBeenCalledWith(false);

        rerender({ collapsed: false });
        expect(result.current.isCollapsed).toBe(false);
    });
});

describe('useLineNumbers', () => {
    it('resyncs line-number visibility when node attrs change externally', () => {
        const onToggle = vi.fn();
        const { result, rerender } = renderHook(
            ({ showLineNumbersAttr }) =>
                useLineNumbers({
                    showLineNumbersAttr,
                    lineNumbersConfig: {
                        enabled: true,
                        allowToggle: true,
                    },
                    onToggle,
                }),
            {
                initialProps: {
                    showLineNumbersAttr: true as boolean | undefined,
                },
            }
        );

        expect(result.current.showLineNumbers).toBe(true);

        rerender({ showLineNumbersAttr: false });
        expect(result.current.showLineNumbers).toBe(false);

        act(() => {
            result.current.toggleLineNumbers();
        });

        expect(result.current.showLineNumbers).toBe(true);
        expect(onToggle).toHaveBeenCalledWith(true);

        rerender({ showLineNumbersAttr: true });
        expect(result.current.showLineNumbers).toBe(true);
    });
});
