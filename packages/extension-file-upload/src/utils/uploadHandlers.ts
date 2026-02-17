import type { LocalStorageOptions, StorageMode, UploadHandler, UploadResult } from '../types';
import { getFileKind, safeFileName } from './file';

// File System Access API 类型声明
interface FileSystemPickerOptions {
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}

declare global {
    interface Window {
        showDirectoryPicker?: (
            options?: FileSystemPickerOptions
        ) => Promise<FileSystemDirectoryHandle>;
    }
}

/**
 * 创建 Object URL 上传处理器（内存模式）
 * 文件仅在内存中，刷新页面后会丢失
 */
export function createObjectUrlUpload(): UploadHandler {
    return async (files): Promise<UploadResult> => {
        return {
            assets: files.map((file) => {
                const kind = getFileKind(file);
                const url = URL.createObjectURL(file);
                return {
                    kind,
                    url,
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    size: file.size,
                };
            }),
        };
    };
}

/**
 * 创建 Base64 上传处理器
 * 将文件转换为 Data URL，可以持久化到文档中
 */
export function createBase64Upload(): UploadHandler {
    return async (files): Promise<UploadResult> => {
        const assets = await Promise.all(
            files.map(
                (file) =>
                    new Promise<UploadResult['assets'][number]>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = String(reader.result || '');
                            resolve({
                                kind: getFileKind(file),
                                url: result,
                                name: file.name,
                                mimeType: file.type || 'application/octet-stream',
                                size: file.size,
                            });
                        };
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(file);
                    })
            )
        );

        return { assets };
    };
}

// 用于缓存用户选择的目录句柄
let cachedDirectoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * 创建本地文件系统上传处理器
 * 使用 File System Access API 将文件保存到用户选择的本地目录
 */
export function createLocalStorageUpload(options?: LocalStorageOptions): UploadHandler {
    return async (files): Promise<UploadResult> => {
        // 检查 File System Access API 是否可用
        if (!('showDirectoryPicker' in window)) {
            console.warn(
                'File System Access API is not available. Falling back to Object URL mode.'
            );
            return createObjectUrlUpload()(files, {} as never);
        }

        const showDirectoryPicker = (
            window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
        ).showDirectoryPicker;

        // 确定要使用的目录句柄
        let dirHandle: FileSystemDirectoryHandle | null = null;

        if (options?.directoryHandle) {
            dirHandle = options.directoryHandle;
        } else if (!options?.alwaysAskDirectory && cachedDirectoryHandle) {
            // 复用之前选择的目录
            dirHandle = cachedDirectoryHandle;
        } else {
            // 请求用户选择目录
            try {
                dirHandle = await showDirectoryPicker({
                    mode: 'readwrite',
                    startIn: 'downloads',
                });
                // 缓存目录句柄以供后续使用
                cachedDirectoryHandle = dirHandle;
            } catch (err) {
                // 用户取消选择或发生错误
                if ((err as Error).name === 'AbortError') {
                    console.warn('User cancelled directory selection.');
                    // 回退到 Object URL 模式
                    return createObjectUrlUpload()(files, {} as never);
                }
                throw err;
            }
        }

        if (!dirHandle) {
            throw new Error('Failed to get directory handle.');
        }

        // 保存文件到本地目录
        const savedFiles: { file: File; savedName: string }[] = [];
        for (const file of files) {
            const name = safeFileName(options?.fileName?.(file) ?? file.name);
            try {
                const fileHandle = await dirHandle.getFileHandle(name, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                savedFiles.push({ file, savedName: name });
            } catch (err) {
                console.error(`Failed to save file ${name}:`, err);
                throw err;
            }
        }

        // 返回 Object URL 用于在编辑器中渲染
        // 注意：这些 URL 在页面刷新后会失效，但文件已保存到本地
        return {
            assets: savedFiles.map(({ file, savedName }) => ({
                kind: getFileKind(file),
                url: URL.createObjectURL(file),
                name: savedName,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
            })),
        };
    };
}

/**
 * @deprecated 请使用 createLocalStorageUpload 代替
 */
export function createFileSystemAccessUpload(options?: LocalStorageOptions): UploadHandler {
    return createLocalStorageUpload(options);
}

/**
 * 根据存储模式创建对应的上传处理器
 */
export function createUploadHandler(
    mode: StorageMode,
    options?: {
        localStorageOptions?: LocalStorageOptions;
        customUpload?: UploadHandler;
    }
): UploadHandler {
    switch (mode) {
        case 'memory':
            return createObjectUrlUpload();
        case 'base64':
            return createBase64Upload();
        case 'local':
            return createLocalStorageUpload(options?.localStorageOptions);
        case 'custom':
            if (!options?.customUpload) {
                throw new Error('Custom upload handler is required when storageMode is "custom".');
            }
            return options.customUpload;
        default:
            return createObjectUrlUpload();
    }
}

/**
 * 清除缓存的目录句柄
 * 调用此函数后，下次上传时会重新请求用户选择目录
 */
export function clearCachedDirectoryHandle(): void {
    cachedDirectoryHandle = null;
}
