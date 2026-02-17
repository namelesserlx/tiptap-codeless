import { FileCardView } from '@/components/FileCardView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadFileCardAttrs = {
    url: string;
    name: string;
    mimeType: string;
    size: number;
};

export const UploadFileCard = Node.create({
    name: 'uploadFileCard',

    group: 'block',
    inline: false,
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            url: { default: null },
            name: { default: '' },
            mimeType: { default: '' },
            size: { default: 0 },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-upload-file-card]',
                getAttrs: (element) => {
                    if (!(element instanceof HTMLElement)) return false;
                    const url = element.getAttribute('data-url') ?? '';
                    const name = element.getAttribute('data-name') ?? '';
                    const mimeType = element.getAttribute('data-mime') ?? '';
                    const sizeRaw = element.getAttribute('data-size');
                    const size = sizeRaw ? Number(sizeRaw) : 0;
                    return {
                        url,
                        name,
                        mimeType,
                        size: Number.isFinite(size) ? size : 0,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { url, name, mimeType, size, ...rest } = HTMLAttributes;
        return [
            'div',
            {
                ...rest,
                'data-upload-file-card': 'true',
                'data-name': name,
                'data-mime': mimeType,
                'data-size': String(size ?? 0),
                'data-url': url,
            },
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FileCardView);
    },
});
