import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useResolvedAssetUrl } from '../src/hooks/useResolvedAssetUrl';

describe('useResolvedAssetUrl', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('hydrates a fresh preview url for local assets when a directory handle is available', async () => {
        const file = new File(['demo'], 'saved-image.png', { type: 'image/png' });
        const createObjectURL = vi.fn(() => 'blob:resolved-image');
        const revokeObjectURL = vi.fn();

        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: createObjectURL,
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            writable: true,
            value: revokeObjectURL,
        });

        const editor = {
            storage: {
                fileUpload: {
                    directoryHandleStore: {
                        get: () => ({
                            getFileHandle: vi.fn(async () => ({
                                getFile: vi.fn(async () => file),
                            })),
                        }),
                    },
                },
            },
        } as never;

        const { result, unmount } = renderHook(() =>
            useResolvedAssetUrl(editor, {
                url: 'blob:stale-image',
                storageMode: 'local',
                storageKey: 'saved-image.png',
            })
        );

        await waitFor(() => {
            expect(result.current).toBe('blob:resolved-image');
        });

        unmount();

        expect(revokeObjectURL).toHaveBeenCalledWith('blob:resolved-image');
    });

    it('falls back to the persisted url when the asset is not a local file reference', () => {
        const createObjectURL = vi.fn();
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: createObjectURL,
        });

        const { result } = renderHook(() =>
            useResolvedAssetUrl(null, {
                url: 'https://example.com/demo.pdf',
                storageMode: 'custom',
                storageKey: 'asset/demo.pdf',
            })
        );

        expect(result.current).toBe('https://example.com/demo.pdf');
        expect(createObjectURL).not.toHaveBeenCalled();
    });
});
