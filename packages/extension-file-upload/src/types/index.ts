import type { Editor } from '@tiptap/core';

export type FileKind = 'image' | 'video' | 'file';

export type StoredAsset = {
    kind: FileKind;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
};

export type UploadResult = {
    assets: StoredAsset[];
};

export type UploadContext = {
    editor: Editor;
    event?: DragEvent | ClipboardEvent | Event;
    position?: number;
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

/**
 * 本地保存选项（用于 'local' 模式）
 */
export type LocalStorageOptions = {
    /** 提供已有的目录句柄，避免重复弹窗选择 */
    directoryHandle?: FileSystemDirectoryHandle;
    /** 自定义文件名生成器 */
    fileName?: (file: File) => string;
    /** 是否在每次上传时都请求新的目录（默认 false，会复用之前选择的目录） */
    alwaysAskDirectory?: boolean;
};

export type FileUploadOptions = {
    /**
     * 存储模式
     * @default 'memory'
     */
    storageMode?: StorageMode;

    /**
     * 本地保存选项（仅当 storageMode 为 'local' 时有效）
     */
    localStorageOptions?: LocalStorageOptions;

    /**
     * 自定义上传处理器（仅当 storageMode 为 'custom' 时必填）
     * 当 storageMode 不是 'custom' 时，此选项会被忽略
     */
    upload?: UploadHandler;

    /**
     * 图片气泡菜单配置
     */
    imgBubbleMenuConfig?: {
        /** 是否启用 */
        enabled?: boolean;
        /** z-index */
        zIndex?: number;
    };

    /** Accept attribute for file picker. Example: 'image/*,video/*' */
    accept?: string;

    /** Allow multiple selection in file picker */
    multiple?: boolean;

    /** If true, handle paste events for files/images */
    handlePaste?: boolean;

    /** If true, handle drop events for files */
    handleDrop?: boolean;

    /** Max size in bytes per file; if exceeded, file is ignored */
    maxFileSize?: number;

    /** Called on error (upload failures, etc.) */
    onError?: (error: unknown) => void;
};

export type InsertFilesParams = {
    files: File[];
    position?: number;
    event?: UploadContext['event'];
};
