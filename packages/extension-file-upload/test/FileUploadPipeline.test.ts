import { describe, expect, it } from 'vitest';
import {
    buildUploadContent,
    filterIncomingFiles,
    resolveInsertPosition,
} from '../src/runtime/uploadPipeline';

describe('FileUpload pipeline', () => {
    it('filters out files that exceed the configured size limit', () => {
        const small = new File(['small'], 'small.txt', { type: 'text/plain' });
        const large = new File([new Uint8Array(6)], 'large.txt', { type: 'text/plain' });

        const result = filterIncomingFiles([small, large], 5);

        expect(result).toEqual([small]);
    });

    it('builds editor content for each supported asset kind', () => {
        const content = buildUploadContent([
            {
                kind: 'image',
                url: 'https://example.com/image.png',
                name: 'image.png',
                mimeType: 'image/png',
                size: 1,
                width: 10,
                height: 20,
                storageMode: 'memory',
            },
            {
                kind: 'video',
                url: 'https://example.com/video.mp4',
                name: 'video.mp4',
                mimeType: 'video/mp4',
                size: 2,
                width: 30,
                height: 40,
                storageMode: 'custom',
                storageKey: 'asset/video-1',
            },
            {
                kind: 'file',
                url: 'https://example.com/file.pdf',
                name: 'file.pdf',
                mimeType: 'application/pdf',
                size: 3,
                storageMode: 'local',
                storageKey: 'file.pdf',
            },
        ]);

        expect(content).toEqual([
            {
                type: 'uploadImage',
                attrs: {
                    src: 'https://example.com/image.png',
                    alt: 'image.png',
                    title: 'image.png',
                    fileName: 'image.png',
                    mimeType: 'image/png',
                    width: 10,
                    height: 20,
                    storageMode: 'memory',
                    storageKey: null,
                },
            },
            { type: 'paragraph' },
            {
                type: 'uploadVideo',
                attrs: {
                    src: 'https://example.com/video.mp4',
                    title: 'video.mp4',
                    fileName: 'video.mp4',
                    mimeType: 'video/mp4',
                    width: 30,
                    height: 40,
                    storageMode: 'custom',
                    storageKey: 'asset/video-1',
                },
            },
            { type: 'paragraph' },
            {
                type: 'uploadFileCard',
                attrs: {
                    url: 'https://example.com/file.pdf',
                    name: 'file.pdf',
                    fileName: 'file.pdf',
                    mimeType: 'application/pdf',
                    size: 3,
                    storageMode: 'local',
                    storageKey: 'file.pdf',
                },
            },
            { type: 'paragraph' },
        ]);
    });

    it('prefers the explicit insert position over the current selection', () => {
        expect(resolveInsertPosition({ files: [], position: 12 }, 5)).toBe(12);
        expect(resolveInsertPosition({ files: [] }, 5)).toBe(5);
    });
});
