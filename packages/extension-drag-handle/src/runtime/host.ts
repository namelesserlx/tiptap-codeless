import type { Editor } from '@tiptap/core';

export function getEditorUiHost(editor: Editor): HTMLElement | null {
    const parentElement = editor.view.dom.parentElement;

    if (parentElement) {
        return parentElement;
    }

    const ownerDocument = editor.view.dom.ownerDocument;

    return ownerDocument?.body ?? null;
}
