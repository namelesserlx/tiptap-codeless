import { createFileUploadPlugin } from '@/extension/FileUploadPlugin';
import { UploadFileCard } from '@/extension/nodes/FileCardNode';
import { UploadImage } from '@/extension/nodes/ImageNode';
import { UploadVideo } from '@/extension/nodes/VideoNode';
import type {
    FileUploadOptions,
    InsertFilesParams,
    StorageMode,
    UploadHandler,
    UploadResult,
} from '@/types';
import { getFileKind } from '@/utils/file';
import { readImageSize, readVideoSize } from '@/utils/imageMeta';
import { createUploadHandler } from '@/utils/uploadHandlers';
import type { Editor, JSONContent } from '@tiptap/core';
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fileUpload: {
            /** 打开文件选择器并插入 */
            openFileDialog: (params?: { accept?: string; multiple?: boolean }) => ReturnType;
            /** 直接插入文件（通常来自 drop/paste/dialog） */
            insertFiles: (params: InsertFilesParams) => Promise<ReturnType> | ReturnType;
        };
    }

    interface Storage {
        fileUpload: {
            imgBubbleMenuConfig?: {
                enabled?: boolean;
                zIndex?: number;
            };
        };
    }
}

const defaultOptions: FileUploadOptions = {
    storageMode: 'memory',
    localStorageOptions: undefined,
    imgBubbleMenuConfig: {
        enabled: true,
        zIndex: 1000,
    },
    upload: undefined,
    accept: undefined,
    multiple: true,
    handlePaste: true,
    handleDrop: true,
    maxFileSize: undefined,
    onError: undefined,
};

export const FileUpload = Extension.create<FileUploadOptions>({
    name: 'fileUpload',

    addOptions() {
        return defaultOptions;
    },

    addStorage() {
        return {
            imgBubbleMenuConfig: this.options.imgBubbleMenuConfig,
        };
    },

    addExtensions() {
        return [UploadImage, UploadVideo, UploadFileCard];
    },

    addProseMirrorPlugins() {
        return [
            createFileUploadPlugin({
                editor: this.editor,
                handleDrop: !!this.options.handleDrop,
                handlePaste: !!this.options.handlePaste,
            }),
        ];
    },

    addCommands() {
        // 获取上传处理器
        const getUploadHandler = (): UploadHandler => {
            return createUploadHandler(
                (this.options.storageMode ?? defaultOptions.storageMode) as StorageMode,
                {
                    localStorageOptions: this.options.localStorageOptions,
                    customUpload: this.options.upload,
                }
            );
        };

        return {
            openFileDialog:
                (params?: { accept?: string; multiple?: boolean }) =>
                ({ editor }) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept =
                        params?.accept ?? this.options.accept ?? defaultOptions.accept ?? '';
                    input.multiple = (params?.multiple ??
                        this.options.multiple ??
                        defaultOptions.multiple) as boolean;
                    input.style.position = 'fixed';
                    input.style.left = '-9999px';

                    const cleanup = () => {
                        input.onchange = null;
                        input.remove();
                    };

                    input.onchange = async () => {
                        try {
                            const files = Array.from(input.files || []);
                            if (files.length > 0) {
                                await editor.commands.insertFiles({ files });
                            }
                        } catch (err) {
                            this.options.onError?.(err);
                        } finally {
                            cleanup();
                        }
                    };

                    document.body.appendChild(input);
                    input.click();
                    return true;
                },

            insertFiles:
                (params: InsertFilesParams) =>
                ({ editor }) => {
                    void (async () => {
                        try {
                            const files = (params.files || []).filter((file) => {
                                if (!this.options.maxFileSize) return true;
                                return file.size <= this.options.maxFileSize;
                            });

                            if (files.length === 0) return;

                            const ctx = {
                                editor,
                                event: params.event,
                                position: params.position,
                            };

                            const uploadHandler = getUploadHandler();
                            const result: UploadResult = await uploadHandler(files, ctx);

                            const assets = await Promise.all(
                                result.assets.map(async (asset) => {
                                    if (asset.kind === 'image' && (!asset.width || !asset.height)) {
                                        const meta = await readImageSize(asset.url);
                                        if (meta) return { ...asset, ...meta };
                                    }
                                    if (asset.kind === 'video' && (!asset.width || !asset.height)) {
                                        const meta = await readVideoSize(asset.url);
                                        if (meta) return { ...asset, ...meta };
                                    }
                                    return asset;
                                })
                            );

                            const assetToContent = (
                                asset: (typeof assets)[number]
                            ): JSONContent[] => {
                                if (asset.kind === 'image') {
                                    return [
                                        {
                                            type: 'uploadImage',
                                            attrs: {
                                                src: asset.url,
                                                alt: asset.name,
                                                title: asset.name,
                                                width: asset.width ?? null,
                                                height: asset.height ?? null,
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
                                                width: asset.width ?? null,
                                                height: asset.height ?? null,
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
                                            mimeType: asset.mimeType,
                                            size: asset.size,
                                        },
                                    },
                                    { type: 'paragraph' },
                                ] as JSONContent[];
                            };

                            const content: JSONContent[] = assets.flatMap(assetToContent);

                            const pos = params.position ?? editor.state.selection.from;
                            editor
                                .chain()
                                .focus()
                                .insertContentAt({ from: pos, to: pos }, content, {
                                    updateSelection: true,
                                })
                                .run();
                        } catch (err) {
                            this.options.onError?.(err);
                        }
                    })();

                    return true;
                },
        };
    },
});

export default FileUpload;

export function inferKinds(files: File[]) {
    return files.map(getFileKind);
}

export function createEditorUploadContext(editor: Editor) {
    return { editor };
}
