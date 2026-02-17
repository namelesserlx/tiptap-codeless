import { VideoView } from '@/components/VideoView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadVideoAttrs = {
    src: string;
    title?: string | null;
    width?: number | null;
    height?: number | null;
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
            width: { default: null },
            height: { default: null },
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
                        width: Number.isFinite(width) ? width : null,
                        height: Number.isFinite(height) ? height : null,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { width, height } = HTMLAttributes as UploadVideoAttrs;
        return [
            'video',
            {
                ...HTMLAttributes,
                'data-upload-video': 'true',
                controls: 'true',
                ...(width ? { width } : {}),
                ...(height ? { height } : {}),
            },
            ['source', { src: HTMLAttributes.src }],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoView);
    },
});
