import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useFullscreen } from '../src/hooks/useFullscreen';

describe('useFullscreen', () => {
    afterEach(() => {
        document.body.style.overflow = '';
    });

    it('keeps body scroll locked until the last fullscreen instance exits', () => {
        document.body.style.overflow = 'scroll';

        const node = {} as never;
        const first = renderHook(() =>
            useFullscreen({
                node,
                getPos: () => 1,
            })
        );
        const second = renderHook(() =>
            useFullscreen({
                node,
                getPos: () => 2,
            })
        );

        act(() => {
            first.result.current.setIsFullscreen(true);
        });
        expect(document.body.style.overflow).toBe('hidden');

        act(() => {
            second.result.current.setIsFullscreen(true);
        });
        expect(document.body.style.overflow).toBe('hidden');

        first.unmount();
        expect(document.body.style.overflow).toBe('hidden');

        second.unmount();
        expect(document.body.style.overflow).toBe('scroll');
    });
});
