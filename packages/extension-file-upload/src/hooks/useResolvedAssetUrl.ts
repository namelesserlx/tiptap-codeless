import type { Editor } from '@tiptap/core';
import { useEffect, useState } from 'react';
import type { AssetMetadata } from '@/types';
import { resolveLocalAssetUrl } from '@/runtime/metadata';

export interface UseResolvedAssetUrlOptions extends AssetMetadata {
    url?: string | null;
}

export function useResolvedAssetUrl(
    editor: Editor | null,
    options: UseResolvedAssetUrlOptions
): string {
    const fallbackUrl = options.url ?? '';
    const { fileName, storageMode, storageKey } = options;
    const requestKey = `${storageMode ?? ''}:${storageKey ?? ''}:${fallbackUrl}`;
    const [resolution, setResolution] = useState<{
        key: string;
        url: string | null;
    }>({
        key: requestKey,
        url: null,
    });

    useEffect(() => {
        let isActive = true;
        let generatedUrl: string | null = null;

        void (async () => {
            const nextUrl = await resolveLocalAssetUrl(editor, {
                fileName,
                storageMode,
                storageKey,
            });

            if (!isActive || !nextUrl) {
                return;
            }

            generatedUrl = nextUrl;
            setResolution({
                key: requestKey,
                url: nextUrl,
            });
        })();

        return () => {
            isActive = false;

            if (generatedUrl) {
                URL.revokeObjectURL(generatedUrl);
            }
        };
    }, [editor, fileName, requestKey, storageMode, storageKey]);

    return resolution.key === requestKey && resolution.url ? resolution.url : fallbackUrl;
}
