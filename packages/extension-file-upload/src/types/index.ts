import type { DeepPartial, SupportedLocale } from '@tiptap-codeless/core';
import type { Editor } from '@tiptap/core';
import type { FileUploadMessages } from '@/i18n';

export type { FileUploadMessages } from '@/i18n';
export type { DirectoryHandleStore } from '@/runtime/dialogLifecycle';

export type FileKind = 'image' | 'video' | 'file';

export type StoredAsset = {
    kind: FileKind;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    fileName?: string | null;
    storageMode?: StorageMode;
    storageKey?: string | null;
    revokeObjectURL?: boolean;
};

export type AssetMetadata = Pick<StoredAsset, 'fileName' | 'storageMode' | 'storageKey'>;

export type BubbleMenuConfig = {
    enabled?: boolean;
    zIndex?: number;
};

export type UploadPlaceholderConfig = {
    enabled?: boolean;
};

export type UploadResult = {
    assets: StoredAsset[];
};

export type UploadProgress = {
    id?: string;
    file?: File;
    fileName?: string;
    loaded?: number;
    total?: number;
    percent?: number;
};

export type UploadProgressReporter = (progress: UploadProgress) => void;

export type UploadContext = {
    editor: Editor;
    event?: DragEvent | ClipboardEvent | Event;
    position?: number;
    onProgress?: UploadProgressReporter;
};

export type UploadHandler = (files: File[], ctx: UploadContext) => Promise<UploadResult>;

/**
 * 存储模式
 * - 'memory': 使用 Object URL（临时，刷新后丢失）
 * - 'base64': 转换为 Base64 Data URL（持久化到文档，但会增大文档体积）
 * - 'local': 使用 File System Access API 保存到本地（需要浏览器支持）
 * - 'custom': 使用自定义上传处理器
 */
export type StorageMode = 'memory' | 'base64' | 'local' | 'custom';

export type FileUploadStorageConfig = {
    /**
     * 存储模式
     * @default 'memory'
     */
    mode?: StorageMode;

    /**
     * 自定义上传处理器（仅当 mode 为 'custom' 时必填）
     */
    upload?: UploadHandler;

    /**
     * 提供已有的目录句柄，避免重复弹窗选择
     */
    directoryHandle?: FileSystemDirectoryHandle;

    /**
     * 自定义文件名生成器
     */
    fileName?: (file: File) => string;

    /**
     * 是否在每次上传时都请求新的目录
     * @default false
     */
    alwaysAskDirectory?: boolean;
};

export type FileUploadPickerConfig = {
    /** Accept attribute for file picker. Example: 'image/*,video/*' */
    accept?: string;

    /** Allow multiple selection in file picker */
    multiple?: boolean;
};

export type FileUploadIngestConfig = {
    /** If true, handle paste events for files/images */
    paste?: boolean;

    /** If true, handle drop events for files */
    drop?: boolean;

    /** MIME types allowed for paste/drop ingestion, aligned with Tiptap FileHandler */
    allowedMimeTypes?: string[];

    /** Max size in bytes per file; if exceeded, file is ignored */
    maxFileSize?: number;
};

export type FileUploadOptions = {
    /**
     * 语言环境
     * @default 'zh-CN'
     */
    locale?: SupportedLocale | string;

    /**
     * 自定义国际化文案
     */
    messages?: DeepPartial<FileUploadMessages>;

    /**
     * 存储配置
     */
    storage?: FileUploadStorageConfig;

    /**
     * 文件选择器配置
     */
    picker?: FileUploadPickerConfig;

    /**
     * 文件摄入配置
     */
    ingest?: FileUploadIngestConfig;

    /**
     * 统一 UI 配置
     */
    ui?: {
        bubbleMenu?: BubbleMenuConfig;
        uploadPlaceholder?: UploadPlaceholderConfig;
    };

    /** Called on error (upload failures, etc.) */
    onError?: (error: unknown) => void;
};

export type InsertFilesParams = {
    files: File[];
    position?: number;
    event?: UploadContext['event'];
    htmlContent?: string;
};

export type { ManagedObjectUrlRegistry } from '@/runtime/assetRegistry';
