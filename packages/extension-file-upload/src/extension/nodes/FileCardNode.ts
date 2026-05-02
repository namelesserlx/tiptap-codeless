import { FileCardView } from '@/components/FileCardView';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export type UploadFileCardAttrs = {
    url: string;
    name: string;
    fileName?: string | null;
    mimeType: string;
    size: number;
    storageMode?: string | null;
    storageKey?: string | null;
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
            fileName: { default: null },
            mimeType: { default: '' },
            size: { default: 0 },
            storageMode: { default: null },
            storageKey: { default: null },
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
                        fileName: element.getAttribute('data-file-name'),
                        mimeType,
                        size: Number.isFinite(size) ? size : 0,
                        storageMode: element.getAttribute('data-storage-mode'),
                        storageKey: element.getAttribute('data-storage-key'),
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { url, name, fileName, mimeType, size, storageMode, storageKey, ...rest } =
            HTMLAttributes as UploadFileCardAttrs;
        return [
            'div',
            {
                ...rest,
                'data-upload-file-card': 'true',
                'data-name': name,
                ...(fileName ? { 'data-file-name': fileName } : {}),
                'data-mime': mimeType,
                'data-size': String(size ?? 0),
                'data-url': url,
                ...(storageMode ? { 'data-storage-mode': storageMode } : {}),
                ...(storageKey ? { 'data-storage-key': storageKey } : {}),
            },
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FileCardView);
    },
});
