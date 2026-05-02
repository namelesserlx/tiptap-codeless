import type { Editor } from '@tiptap/core';

export type DirectoryHandleStore = {
    get: () => FileSystemDirectoryHandle | null;
    set: (handle: FileSystemDirectoryHandle | null) => void;
    clear: () => void;
};

export function createDirectoryHandleStore(
    initialHandle: FileSystemDirectoryHandle | null = null
): DirectoryHandleStore {
    let currentHandle = initialHandle;

    return {
        get() {
            return currentHandle;
        },
        set(handle) {
            currentHandle = handle;
        },
        clear() {
            currentHandle = null;
        },
    };
}

export function clearEditorDirectoryHandle(editor?: Editor | null): void {
    editor?.storage?.fileUpload?.directoryHandleStore?.clear();
}
