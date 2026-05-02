import { VideoView } from '@/components/VideoView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadVideoAttrs = {
    src: string;
    title?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    storageMode?: string | null;
    storageKey?: string | null;
};

export const UploadVideo = Node.create({
    name: 'uploadVideo',

    group: 'block',
    inline: false,
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            title: { default: null },
            fileName: { default: null },
            mimeType: { default: null },
            width: { default: null },
            height: { default: null },
            storageMode: { default: null },
            storageKey: { default: null },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video[data-upload-video]',
                getAttrs: (element) => {
                    if (!(element instanceof HTMLVideoElement)) return false;
                    const source = element.querySelector('source');
                    const src = source?.getAttribute('src') ?? element.getAttribute('src');
                    const widthAttr = element.getAttribute('width');
                    const heightAttr = element.getAttribute('height');
                    const width = widthAttr ? Number(widthAttr) : null;
                    const height = heightAttr ? Number(heightAttr) : null;
                    return {
                        src,
                        title: element.getAttribute('title'),
                        fileName: element.getAttribute('data-file-name'),
                        mimeType: element.getAttribute('data-mime-type'),
                        width: Number.isFinite(width) ? width : null,
                        height: Number.isFinite(height) ? height : null,
                        storageMode: element.getAttribute('data-storage-mode'),
                        storageKey: element.getAttribute('data-storage-key'),
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { width, height, fileName, mimeType, storageMode, storageKey } =
            HTMLAttributes as UploadVideoAttrs;
        return [
            'video',
            {
                ...HTMLAttributes,
                'data-upload-video': 'true',
                controls: 'true',
                ...(width ? { width } : {}),
                ...(height ? { height } : {}),
                ...(fileName ? { 'data-file-name': fileName } : {}),
                ...(mimeType ? { 'data-mime-type': mimeType } : {}),
                ...(storageMode ? { 'data-storage-mode': storageMode } : {}),
                ...(storageKey ? { 'data-storage-key': storageKey } : {}),
            },
            ['source', { src: HTMLAttributes.src }],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoView);
    },
});
