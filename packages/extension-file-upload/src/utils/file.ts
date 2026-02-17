import type { FileKind } from '../types';

export const isImageMime = (mimeType: string) => mimeType.startsWith('image/');
export const isVideoMime = (mimeType: string) => mimeType.startsWith('video/');

export function getFileKind(file: File): FileKind {
    if (isImageMime(file.type)) return 'image';
    if (isVideoMime(file.type)) return 'video';
    return 'file';
}

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, idx);
    const digits = idx === 0 ? 0 : value < 10 ? 1 : 0;
    return `${value.toFixed(digits)} ${units[idx]}`;
}

export function safeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, '_');
}
