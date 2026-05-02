import { createFileUploadPlugin, fileUploadPluginKey } from '@/extension/FileUploadPlugin';
import { UploadFileCard } from '@/extension/nodes/FileCardNode';
import { UploadImage } from '@/extension/nodes/ImageNode';
import { UploadVideo } from '@/extension/nodes/VideoNode';
import {
    defaultFileUploadOptions,
    normalizeFileUploadOptions,
} from '@/config/normalizeOptions';
import { resolveFileUploadMessages } from '@/i18n';
import { createManagedObjectUrlRegistry } from '@/runtime/assetRegistry';
import { createDirectoryHandleStore } from '@/runtime/dialogLifecycle';
import {
    buildUploadContent,
    enrichUploadedAssets,
    filterIncomingFiles,
    resolveInsertPosition,
    resolveUploadHandler,
    trackManagedAssets,
} from '@/runtime/uploadPipeline';
import {
    createUploadPlaceholderId,
    findUploadPlaceholderPosition,
    normalizeUploadProgressPercent,
    type UploadPlaceholder,
    type UploadPlaceholderMeta,
    type UploadPlaceholderPluginState,
} from '@/runtime/uploadPlaceholders';
import type {
    FileUploadOptions,
    InsertFilesParams,
    UploadProgress,
} from '@/types';
import { getFileKind } from '@/utils/file';
import type { Editor, JSONContent } from '@tiptap/core';
import { Extension } from '@tiptap/core';

export const FileUpload = Extension.create<FileUploadOptions>({
    name: 'fileUpload',

    addOptions() {
        return defaultFileUploadOptions;
    },

    addStorage() {
        const normalizedOptions = normalizeFileUploadOptions(this.options);

        return {
            ui: {
                bubbleMenu: normalizedOptions.ui.bubbleMenu,
                uploadPlaceholder: normalizedOptions.ui.uploadPlaceholder,
            },
            messages: resolveFileUploadMessages(
                normalizedOptions.locale,
                normalizedOptions.messages
            ),
            managedObjectUrls: createManagedObjectUrlRegistry(),
            directoryHandleStore: createDirectoryHandleStore(
                normalizedOptions.storage.directoryHandle ?? null
            ),
        };
    },

    addExtensions() {
        return [UploadImage, UploadVideo, UploadFileCard];
    },

    addProseMirrorPlugins() {
        const normalizedOptions = normalizeFileUploadOptions(this.options);

        return [
            createFileUploadPlugin({
                ingest: normalizedOptions.ingest,
                onDrop: ({ files, position, event }) => {
                    void this.editor.commands.insertFiles({ files, position, event });
                },
                onPaste: ({ files, position, event, htmlContent }) => {
                    void this.editor.commands.insertFiles({
                        files,
                        position,
                        event,
                        htmlContent,
                    });
                },
                managedObjectUrls: this.storage.managedObjectUrls,
            }),
        ];
    },

    addCommands() {
        const normalizedOptions = normalizeFileUploadOptions(this.options);

        return {
            openFileDialog:
                (params?: { accept?: string; multiple?: boolean }) =>
                ({ editor }) => {
                    if (!editor.isEditable) {
                        return false;
                    }

                    const input = document.createElement('input');
                    let settled = false;
                    input.type = 'file';
                    input.accept = params?.accept ?? normalizedOptions.picker.accept ?? '';
                    input.multiple = params?.multiple ?? normalizedOptions.picker.multiple;
                    input.style.position = 'fixed';
                    input.style.left = '-9999px';

                    const cleanup = () => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(safetyTimer);
                        input.onchange = null;
                        input.oncancel = null;
                        window.removeEventListener('focus', handleWindowFocus, true);
                        input.remove();
                    };

                    const safetyTimer = window.setTimeout(() => {
                        cleanup();
                    }, 300_000);

                    const handleWindowFocus = () => {
                        window.setTimeout(() => {
                            if (!settled && (input.files?.length ?? 0) === 0) {
                                cleanup();
                            }
                        }, 0);
                    };

                    input.oncancel = () => {
                        cleanup();
                    };

                    input.onchange = async () => {
                        try {
                            const files = Array.from(input.files || []);
                            if (files.length > 0) {
                                await editor.commands.insertFiles({ files });
                            }
                        } catch (err) {
                            normalizedOptions.onError?.(err);
                        } finally {
                            cleanup();
                        }
                    };

                    document.body.appendChild(input);
                    window.addEventListener('focus', handleWindowFocus, true);
                    input.click();
                    return true;
                },

            insertFiles:
                (params: InsertFilesParams) =>
                ({ editor }) => {
                    if (!editor.isEditable) {
                        return false;
                    }

                    void (async () => {
                        let placeholderIds: string[] = [];
                        let placeholderEnabled = false;

                        try {
                            const files = filterIncomingFiles(
                                params.files || [],
                                normalizedOptions.ingest.maxFileSize
                            );

                            if (files.length === 0) return;

                            const initialInsertPosition = resolveInsertPosition(
                                params,
                                editor.state.selection.from
                            );
                            const uploadTargets = createUploadTargets(
                                files,
                                initialInsertPosition,
                                this.storage.messages?.upload?.uploading ?? 'Uploading'
                            );
                            placeholderIds = uploadTargets.map(({ placeholder }) => placeholder.id);
                            placeholderEnabled =
                                normalizedOptions.ui.uploadPlaceholder.enabled !== false;

                            if (placeholderEnabled) {
                                dispatchUploadPlaceholderMeta(editor, {
                                    type: 'add',
                                    placeholders: uploadTargets.map(
                                        ({ placeholder }) => placeholder
                                    ),
                                });
                            }

                            const reportProgress = (progress: UploadProgress) => {
                                if (!placeholderEnabled) return;

                                const percent = normalizeUploadProgressPercent(progress);
                                if (percent === undefined) return;

                                const ids = resolveProgressTargetIds(progress, uploadTargets);
                                if (ids.length === 0) return;

                                dispatchUploadPlaceholderMeta(editor, {
                                    type: 'update',
                                    ids,
                                    percent,
                                });
                            };

                            const ctx = {
                                editor,
                                event: params.event,
                                position: params.position,
                                onProgress: reportProgress,
                            };

                            const uploadHandler = resolveUploadHandler({
                                storage: normalizedOptions.storage,
                                directoryHandleStore: this.storage.directoryHandleStore,
                            });
                            const result = await uploadHandler(files, ctx);
                            const assets = await enrichUploadedAssets(result.assets);
                            trackManagedAssets(assets, this.storage.managedObjectUrls);

                            if (editor.isDestroyed) {
                                return;
                            }

                            const content: JSONContent[] = buildUploadContent(assets);
                            const pos =
                                getPlaceholderInsertPosition(editor, placeholderIds) ??
                                initialInsertPosition;

                            if (placeholderEnabled) {
                                dispatchUploadPlaceholderMeta(editor, {
                                    type: 'remove',
                                    ids: placeholderIds,
                                });
                            }

                            if (content.length === 0) {
                                return;
                            }

                            editor
                                .chain()
                                .focus()
                                .insertContentAt({ from: pos, to: pos }, content, {
                                    updateSelection: true,
                                })
                                .run();
                        } catch (err) {
                            if (placeholderEnabled && placeholderIds.length > 0) {
                                dispatchUploadPlaceholderMeta(editor, {
                                    type: 'remove',
                                    ids: placeholderIds,
                                });
                            }
                            normalizedOptions.onError?.(err);
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

function createUploadTargets(
    files: File[],
    pos: number,
    statusLabel: string
): Array<{ file: File; placeholder: UploadPlaceholder }> {
    return files.map((file) => ({
        file,
        placeholder: {
            id: createUploadPlaceholderId(),
            pos,
            kind: getFileKind(file),
            name: file.name || 'untitled',
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            statusLabel,
        },
    }));
}

function resolveProgressTargetIds(
    progress: UploadProgress,
    uploadTargets: Array<{ file: File; placeholder: UploadPlaceholder }>
): string[] {
    if (progress.id) {
        return uploadTargets.some(({ placeholder }) => placeholder.id === progress.id)
            ? [progress.id]
            : [];
    }

    if (progress.file) {
        return uploadTargets
            .filter(({ file }) => file === progress.file)
            .map(({ placeholder }) => placeholder.id);
    }

    if (progress.fileName) {
        return uploadTargets
            .filter(({ file }) => file.name === progress.fileName)
            .map(({ placeholder }) => placeholder.id);
    }

    return uploadTargets.map(({ placeholder }) => placeholder.id);
}

function dispatchUploadPlaceholderMeta(editor: Editor, meta: UploadPlaceholderMeta): void {
    if (editor.isDestroyed) {
        return;
    }

    editor.view.dispatch(editor.state.tr.setMeta(fileUploadPluginKey, meta));
}

function getPlaceholderInsertPosition(editor: Editor, ids: string[]): number | undefined {
    const state = fileUploadPluginKey.getState(editor.state) as
        | UploadPlaceholderPluginState
        | undefined;

    return findUploadPlaceholderPosition(state, ids);
}
