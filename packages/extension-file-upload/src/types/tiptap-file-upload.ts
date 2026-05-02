import '@tiptap/core';
import type {
    BubbleMenuConfig,
    FileUploadMessages,
    InsertFilesParams,
    UploadPlaceholderConfig,
} from '../types';
import type { ManagedObjectUrlRegistry } from '../runtime/assetRegistry';
import type { DirectoryHandleStore } from '../runtime/dialogLifecycle';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fileUpload: {
            openFileDialog: (params?: { accept?: string; multiple?: boolean }) => ReturnType;
            insertFiles: (params: InsertFilesParams) => Promise<ReturnType> | ReturnType;
        };
    }

    interface Storage {
        fileUpload: {
            ui?: {
                bubbleMenu?: BubbleMenuConfig;
                uploadPlaceholder?: UploadPlaceholderConfig;
            };
            messages?: FileUploadMessages;
            managedObjectUrls?: ManagedObjectUrlRegistry;
            directoryHandleStore?: DirectoryHandleStore;
        };
    }
}

export {};
