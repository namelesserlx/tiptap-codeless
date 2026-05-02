import { ResizableImageView } from '@/components/ResizableImageView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadImageAttrs = {
    src: string;
    alt?: string | null;
    title?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    align?: 'left' | 'center' | 'right' | null;
    storageMode?: string | null;
    storageKey?: string | null;
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
            fileName: { default: null },
            mimeType: { default: null },
            width: { default: null },
            height: { default: null },
            storageMode: { default: null },
            storageKey: { default: null },
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
                        fileName: element.getAttribute('data-file-name'),
                        mimeType: element.getAttribute('data-mime-type'),
                        width: Number.isFinite(width) ? width : null,
                        height: Number.isFinite(height) ? height : null,
                        align,
                        storageMode: element.getAttribute('data-storage-mode'),
                        storageKey: element.getAttribute('data-storage-key'),
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { width, height, align, fileName, mimeType, storageMode, storageKey } =
            HTMLAttributes as UploadImageAttrs;
        return [
            'img',
            {
                ...HTMLAttributes,
                'data-upload-image': 'true',
                ...(width ? { width } : {}),
                ...(height ? { height } : {}),
                ...(align ? { 'data-align': align } : {}),
                ...(fileName ? { 'data-file-name': fileName } : {}),
                ...(mimeType ? { 'data-mime-type': mimeType } : {}),
                ...(storageMode ? { 'data-storage-mode': storageMode } : {}),
                ...(storageKey ? { 'data-storage-key': storageKey } : {}),
            },
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
