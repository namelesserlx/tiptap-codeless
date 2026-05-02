import { mergeUiConfig } from '@tiptap-codeless/core';
import type { DeepPartial } from '@tiptap-codeless/core';
import type { FileUploadMessages } from '@/i18n';
import type {
    BubbleMenuConfig,
    FileUploadOptions,
    FileUploadStorageConfig,
    StorageMode,
    UploadHandler,
    UploadPlaceholderConfig,
} from '@/types';

export const defaultFileUploadOptions: FileUploadOptions = {
    locale: 'zh-CN',
    messages: {},
    storage: {
        mode: 'memory',
        upload: undefined,
        directoryHandle: undefined,
        fileName: undefined,
        alwaysAskDirectory: false,
    },
    picker: {
        accept: undefined,
        multiple: true,
    },
    ingest: {
        paste: true,
        drop: true,
        allowedMimeTypes: undefined,
        maxFileSize: undefined,
    },
    ui: {
        bubbleMenu: {
            enabled: true,
            zIndex: 1000,
        },
        uploadPlaceholder: {
            enabled: true,
        },
    },
    onError: undefined,
};

export interface NormalizedFileUploadOptions extends FileUploadOptions {
    locale: string;
    messages: DeepPartial<FileUploadMessages>;
    storage: {
        mode: StorageMode;
        upload?: UploadHandler;
        directoryHandle?: FileSystemDirectoryHandle;
        fileName?: FileUploadStorageConfig['fileName'];
        alwaysAskDirectory: boolean;
    };
    picker: {
        accept?: string;
        multiple: boolean;
    };
    ingest: {
        paste: boolean;
        drop: boolean;
        allowedMimeTypes?: string[];
        maxFileSize?: number;
    };
    ui: {
        bubbleMenu: BubbleMenuConfig;
        uploadPlaceholder: UploadPlaceholderConfig;
    };
}

function normalizeStorageConfig(
    storage: FileUploadOptions['storage']
): NormalizedFileUploadOptions['storage'] {
    const defaults = defaultFileUploadOptions.storage;

    return {
        mode: storage?.mode ?? defaults?.mode ?? 'memory',
        upload: storage?.upload ?? defaults?.upload,
        directoryHandle: storage?.directoryHandle ?? defaults?.directoryHandle,
        fileName: storage?.fileName ?? defaults?.fileName,
        alwaysAskDirectory: storage?.alwaysAskDirectory ?? defaults?.alwaysAskDirectory ?? false,
    };
}

function normalizePickerConfig(
    picker: FileUploadOptions['picker']
): NormalizedFileUploadOptions['picker'] {
    const defaults = defaultFileUploadOptions.picker;

    return {
        accept: picker?.accept ?? defaults?.accept,
        multiple: picker?.multiple ?? defaults?.multiple ?? true,
    };
}

function normalizeIngestConfig(
    ingest: FileUploadOptions['ingest']
): NormalizedFileUploadOptions['ingest'] {
    const defaults = defaultFileUploadOptions.ingest;

    return {
        paste: ingest?.paste ?? defaults?.paste ?? true,
        drop: ingest?.drop ?? defaults?.drop ?? true,
        allowedMimeTypes: ingest?.allowedMimeTypes ?? defaults?.allowedMimeTypes,
        maxFileSize: ingest?.maxFileSize ?? defaults?.maxFileSize,
    };
}

function normalizeBubbleMenuConfig(options: FileUploadOptions): BubbleMenuConfig {
    return mergeUiConfig<BubbleMenuConfig>(
        defaultFileUploadOptions.ui?.bubbleMenu,
        options.ui?.bubbleMenu
    );
}

function normalizeUploadPlaceholderConfig(options: FileUploadOptions): UploadPlaceholderConfig {
    return mergeUiConfig<UploadPlaceholderConfig>(
        defaultFileUploadOptions.ui?.uploadPlaceholder,
        options.ui?.uploadPlaceholder
    );
}

export function normalizeFileUploadOptions(
    options: FileUploadOptions = {}
): NormalizedFileUploadOptions {
    return {
        ...defaultFileUploadOptions,
        ...options,
        locale: options.locale ?? defaultFileUploadOptions.locale ?? 'zh-CN',
        messages: options.messages ?? defaultFileUploadOptions.messages ?? {},
        storage: normalizeStorageConfig(options.storage),
        picker: normalizePickerConfig(options.picker),
        ingest: normalizeIngestConfig(options.ingest),
        ui: {
            bubbleMenu: normalizeBubbleMenuConfig(options),
            uploadPlaceholder: normalizeUploadPlaceholderConfig(options),
        },
        onError: options.onError ?? defaultFileUploadOptions.onError,
    };
}
