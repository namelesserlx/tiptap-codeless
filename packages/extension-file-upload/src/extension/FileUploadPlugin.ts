import { Plugin, PluginKey } from '@tiptap/pm/state';
import { filterFilesByMimeTypes, hasClipboardHtmlContent } from '@/runtime/fileIngress';
import {
    applyUploadPlaceholderTransaction,
    createUploadPlaceholderState,
    type UploadPlaceholderMeta,
} from '@/runtime/uploadPlaceholders';
import type { ManagedObjectUrlRegistry } from '@/utils/objectUrlRegistry';
import type { FileUploadIngestConfig, InsertFilesParams } from '@/types';

export const fileUploadPluginKey = new PluginKey('tiptap-file-upload');

export type FileUploadPluginOptions = {
    ingest: Pick<FileUploadIngestConfig, 'drop' | 'paste' | 'allowedMimeTypes'>;
    onDrop?: (params: InsertFilesParams) => void;
    onPaste?: (params: InsertFilesParams) => void;
    managedObjectUrls?: ManagedObjectUrlRegistry;
};

export function createFileUploadPlugin(options: FileUploadPluginOptions) {
    const { ingest, onDrop, onPaste, managedObjectUrls } = options;
    const { drop, paste, allowedMimeTypes } = ingest;

    return new Plugin({
        key: fileUploadPluginKey,
        state: {
            init(_, state) {
                return createUploadPlaceholderState(state.doc, []);
            },
            apply(transaction, pluginState) {
                return applyUploadPlaceholderTransaction(
                    transaction,
                    pluginState,
                    transaction.getMeta(fileUploadPluginKey) as UploadPlaceholderMeta | undefined
                );
            },
        },
        view() {
            return {
                update(view, previousState) {
                    if (!managedObjectUrls || previousState.doc.eq(view.state.doc)) {
                        return;
                    }

                    managedObjectUrls.sync(view.state.doc);
                },
                destroy() {
                    managedObjectUrls?.revokeAll();
                },
            };
        },
        props: {
            decorations(state) {
                return fileUploadPluginKey.getState(state)?.decorations;
            },
            handleDrop(view, event) {
                if (view.editable === false) return false;
                if (!drop || !onDrop) return false;
                const dt = event.dataTransfer;
                if (!dt) return false;
                const files = filterFilesByMimeTypes(Array.from(dt.files || []), allowedMimeTypes);
                if (files.length === 0) return false;

                event.preventDefault();
                event.stopPropagation();

                const coords = { left: event.clientX, top: event.clientY };
                const pos = view.posAtCoords(coords)?.pos;

                onDrop({ files, position: pos, event });
                return true;
            },
            handlePaste(view, event) {
                if (view.editable === false) return false;
                if (!paste || !onPaste) return false;
                const files = filterFilesByMimeTypes(
                    Array.from(event.clipboardData?.files || []),
                    allowedMimeTypes
                );
                if (files.length === 0) return false;
                const htmlContent = event.clipboardData?.getData('text/html') ?? '';

                event.preventDefault();
                event.stopPropagation();
                const pos = view.state.selection.from;
                onPaste({ files, position: pos, event, htmlContent });

                // Keep HTML available for other extensions when clipboard carries both.
                return !hasClipboardHtmlContent(htmlContent);
            },
        },
    });
}
