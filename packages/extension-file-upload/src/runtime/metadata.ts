import type { Editor } from '@tiptap/core';
import type { AssetMetadata } from '@/types';

export function isLocalAsset(metadata: AssetMetadata): metadata is AssetMetadata & {
    storageMode: 'local';
    storageKey: string;
} {
    return metadata.storageMode === 'local' && Boolean(metadata.storageKey);
}

export async function resolveLocalAssetUrl(
    editor: Editor | null,
    metadata: AssetMetadata
): Promise<string | null> {
    if (!editor || !isLocalAsset(metadata)) {
        return null;
    }

    const directoryHandle =
        editor.storage?.fileUpload?.directoryHandleStore?.get?.() ?? null;

    if (!directoryHandle) {
        return null;
    }

    const fileHandle = await directoryHandle.getFileHandle(metadata.storageKey, {
        create: false,
    });
    const file = await fileHandle.getFile();

    return URL.createObjectURL(file);
}
