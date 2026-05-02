import type { JSONContent } from '@tiptap/core';
import type {
    DirectoryHandleStore,
    FileUploadStorageConfig,
    InsertFilesParams,
    ManagedObjectUrlRegistry,
    StoredAsset,
} from '@/types';
import { readImageSize, readVideoSize } from '@/utils/imageMeta';
import { createUploadHandler } from '@/utils/uploadHandlers';

export function filterIncomingFiles(files: File[], maxFileSize?: number): File[] {
    if (!maxFileSize) {
        return files;
    }

    return files.filter((file) => file.size <= maxFileSize);
}

export function resolveUploadHandler(options: {
    storage: FileUploadStorageConfig;
    directoryHandleStore?: DirectoryHandleStore;
}) {
    return createUploadHandler(options.storage, {
        directoryHandleStore: options.directoryHandleStore,
    });
}

export async function enrichUploadedAssets(assets: StoredAsset[]): Promise<StoredAsset[]> {
    return Promise.all(
        assets.map(async (asset) => {
            if (asset.kind === 'image' && (!asset.width || !asset.height)) {
                const meta = await readImageSize(asset.url);

                if (meta) {
                    return { ...asset, ...meta };
                }
            }

            if (asset.kind === 'video' && (!asset.width || !asset.height)) {
                const meta = await readVideoSize(asset.url);

                if (meta) {
                    return { ...asset, ...meta };
                }
            }

            return asset;
        })
    );
}

export function trackManagedAssets(
    assets: StoredAsset[],
    managedObjectUrls?: ManagedObjectUrlRegistry
): void {
    for (const asset of assets) {
        if (asset.revokeObjectURL) {
            managedObjectUrls?.track(asset.url);
        }
    }
}

export function buildUploadContent(assets: StoredAsset[]): JSONContent[] {
    return assets.flatMap((asset) => {
        const fileName = asset.fileName ?? asset.name;

        if (asset.kind === 'image') {
            return [
                {
                    type: 'uploadImage',
                    attrs: {
                        src: asset.url,
                        alt: asset.name,
                        title: asset.name,
                        fileName,
                        mimeType: asset.mimeType,
                        width: asset.width ?? null,
                        height: asset.height ?? null,
                        storageMode: asset.storageMode ?? null,
                        storageKey: asset.storageKey ?? null,
                    },
                },
                { type: 'paragraph' },
            ] as JSONContent[];
        }

        if (asset.kind === 'video') {
            return [
                {
                    type: 'uploadVideo',
                    attrs: {
                        src: asset.url,
                        title: asset.name,
                        fileName,
                        mimeType: asset.mimeType,
                        width: asset.width ?? null,
                        height: asset.height ?? null,
                        storageMode: asset.storageMode ?? null,
                        storageKey: asset.storageKey ?? null,
                    },
                },
                { type: 'paragraph' },
            ] as JSONContent[];
        }

        return [
            {
                type: 'uploadFileCard',
                attrs: {
                    url: asset.url,
                    name: asset.name,
                    fileName,
                    mimeType: asset.mimeType,
                    size: asset.size,
                    storageMode: asset.storageMode ?? null,
                    storageKey: asset.storageKey ?? null,
                },
            },
            { type: 'paragraph' },
        ] as JSONContent[];
    });
}

export function resolveInsertPosition(params: InsertFilesParams, fallbackPosition: number): number {
    return params.position ?? fallbackPosition;
}
