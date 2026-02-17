import type { Editor } from '@tiptap/core';
import { useCallback } from 'react';
import type { InsertFilesParams } from '../types';

export function useFileUpload(editor: Editor | null) {
    const openFileDialog = useCallback(
        (params?: { accept?: string; multiple?: boolean }) => {
            if (!editor) return false;
            return editor.commands.openFileDialog(params);
        },
        [editor]
    );

    const insertFiles = useCallback(
        async (params: InsertFilesParams) => {
            if (!editor) return false;
            return editor.commands.insertFiles(params);
        },
        [editor]
    );

    return {
        openFileDialog,
        insertFiles,
    };
}
