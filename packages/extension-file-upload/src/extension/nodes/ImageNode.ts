import { ResizableImageView } from '@/components/ResizableImageView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadImageAttrs = {
    src: string;
    alt?: string | null;
    title?: string | null;
    width?: number | null;
    height?: number | null;
    align?: 'left' | 'center' | 'right' | null;
};

export const UploadImage = Node.create({
    name: 'uploadImage',

    group: 'block',
    inline: false,
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            width: { default: null },
            height: { default: null },
            align: {
                default: null,
                parseHTML: (element) => {
                    const align = element.getAttribute('data-align');
                    return align === 'left' || align === 'center' || align === 'right'
                        ? align
                        : null;
                },
                renderHTML: ({ align }) => {
                    if (!align) return {};
                    return { 'data-align': align };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[data-upload-image]',
                getAttrs: (element) => {
                    if (!(element instanceof HTMLImageElement)) return false;
                    const widthAttr = element.getAttribute('width');
                    const heightAttr = element.getAttribute('height');
                    const alignAttr = element.getAttribute('data-align');
                    const width = widthAttr ? Number(widthAttr) : null;
                    const height = heightAttr ? Number(heightAttr) : null;
                    const align =
                        alignAttr === 'left' || alignAttr === 'center' || alignAttr === 'right'
                            ? alignAttr
                            : null;
                    return {
                        src: element.getAttribute('src'),
                        alt: element.getAttribute('alt'),
                        title: element.getAttribute('title'),
                        width: Number.isFinite(width) ? width : null,
                        height: Number.isFinite(height) ? height : null,
                        align,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { width, height, align } = HTMLAttributes as UploadImageAttrs;
        return [
            'img',
            {
                ...HTMLAttributes,
                'data-upload-image': 'true',
                ...(width ? { width } : {}),
                ...(height ? { height } : {}),
                ...(align ? { 'data-align': align } : {}),
            },
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
