import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const fileUploadPluginKey = new PluginKey('tiptap-file-upload');

export type FileUploadPluginOptions = {
    editor: Editor;
    handleDrop: boolean;
    handlePaste: boolean;
};

export function createFileUploadPlugin(options: FileUploadPluginOptions) {
    const { editor, handleDrop, handlePaste } = options;

    return new Plugin({
        key: fileUploadPluginKey,
        props: {
            handleDrop(view, event) {
                if (!handleDrop) return false;
                const dt = event.dataTransfer;
                if (!dt) return false;
                const files = Array.from(dt.files || []);
                if (files.length === 0) return false;

                event.preventDefault();

                const coords = { left: event.clientX, top: event.clientY };
                const pos = view.posAtCoords(coords)?.pos;

                void editor.commands.insertFiles({ files, position: pos, event });
                return true;
            },
            handlePaste(view, event) {
                if (!handlePaste) return false;
                const files = Array.from(event.clipboardData?.files || []);
                if (files.length === 0) return false;

                const pos = view.state.selection.from;
                void editor.commands.insertFiles({ files, position: pos, event });
                return true;
            },
        },
    });
}
