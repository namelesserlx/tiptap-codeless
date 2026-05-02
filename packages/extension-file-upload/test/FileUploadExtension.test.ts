import { Editor, Node } from '@tiptap/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileUpload } from '../src/extension/FileUploadExtension';

async function flushAsyncWork() {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
}

function createEditor(options?: Parameters<typeof FileUpload.configure>[0]) {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const Doc = Node.create({
        name: 'doc',
        topNode: true,
        content: 'block+',
    });

    const Paragraph = Node.create({
        name: 'paragraph',
        group: 'block',
        content: 'inline*',
        parseHTML() {
            return [{ tag: 'p' }];
        },
        renderHTML({ HTMLAttributes }) {
            return ['p', HTMLAttributes, 0];
        },
    });

    const Text = Node.create({
        name: 'text',
        group: 'inline',
    });

    const editor = new Editor({
        element,
        extensions: [Doc, Paragraph, Text, FileUpload.configure(options ?? {})],
        content: '<p>hello</p>',
    });

    return { editor, element };
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('FileUpload extension', () => {
    it('exposes only the canonical 1.0 bubble menu storage shape', () => {
        const { editor } = createEditor({
            ui: {
                bubbleMenu: {
                    enabled: false,
                    zIndex: 4321,
                },
            },
        });

        expect(editor.storage.fileUpload.ui?.bubbleMenu).toEqual({
            enabled: false,
            zIndex: 4321,
        });
        expect(editor.storage.fileUpload.ui?.uploadPlaceholder).toEqual({
            enabled: true,
        });
        expect(editor.storage.fileUpload).not.toHaveProperty('imgBubbleMenuConfig');

        editor.destroy();
    });

    it('seeds the directory handle store from the canonical storage config', () => {
        const directoryHandle = {
            getFileHandle: vi.fn(),
        } as unknown as FileSystemDirectoryHandle;
        const { editor } = createEditor({
            storage: {
                mode: 'local',
                directoryHandle,
            },
        });

        expect(editor.storage.fileUpload.directoryHandleStore?.get()).toBe(directoryHandle);

        editor.destroy();
    });

    it('revokes managed object urls after uploaded assets are removed from the document', async () => {
        const createObjectURL = vi.fn(() => 'blob:managed-image');
        const revokeObjectURL = vi.fn();

        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: createObjectURL,
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            writable: true,
            value: revokeObjectURL,
        });

        const { editor } = createEditor({
            storage: {
                mode: 'memory',
            },
        });

        const file = new File(['demo'], 'demo.pdf', { type: 'application/pdf' });
        editor.commands.insertFiles({ files: [file] });

        await flushAsyncWork();
        expect(createObjectURL).toHaveBeenCalled();
        expect(editor.getHTML()).toContain('blob:managed-image');

        editor.commands.clearContent();
        await flushAsyncWork();

        expect(revokeObjectURL).toHaveBeenCalledWith('blob:managed-image');

        editor.destroy();
    });

    it('removes hidden file inputs when the file picker closes without a selection', async () => {
        vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

        const { editor } = createEditor();
        expect(document.querySelectorAll('input[type="file"]')).toHaveLength(0);

        editor.commands.openFileDialog();
        expect(document.querySelectorAll('input[type="file"]')).toHaveLength(1);

        window.dispatchEvent(new Event('focus'));
        await flushAsyncWork();

        expect(document.querySelectorAll('input[type="file"]')).toHaveLength(0);

        editor.destroy();
    });

    it('keeps the local directory handle cache scoped to a single editor instance', async () => {
        const createWritable = vi.fn(async () => ({
            write: vi.fn(),
            close: vi.fn(),
        }));
        const firstHandle = {
            getFileHandle: vi.fn(async () => ({
                createWritable,
            })),
        } satisfies Partial<FileSystemDirectoryHandle>;
        const secondHandle = {
            getFileHandle: vi.fn(async () => ({
                createWritable,
            })),
        } satisfies Partial<FileSystemDirectoryHandle>;
        const showDirectoryPicker = vi
            .fn()
            .mockResolvedValueOnce(firstHandle)
            .mockResolvedValueOnce(secondHandle);
        const createObjectURL = vi
            .fn()
            .mockReturnValueOnce('blob:first')
            .mockReturnValueOnce('blob:second')
            .mockReturnValueOnce('blob:third');

        Object.defineProperty(window, 'showDirectoryPicker', {
            configurable: true,
            writable: true,
            value: showDirectoryPicker,
        });
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: createObjectURL,
        });

        const first = createEditor({
            storage: {
                mode: 'local',
                alwaysAskDirectory: false,
            },
        });
        vi.spyOn(first.editor.view, 'coordsAtPos').mockReturnValue({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });
        const file = new File(['demo'], 'demo.txt', { type: 'text/plain' });

        first.editor.commands.insertFiles({ files: [file] });
        await flushAsyncWork();
        first.editor.commands.insertFiles({ files: [file] });
        await flushAsyncWork();

        expect(showDirectoryPicker).toHaveBeenCalledTimes(1);

        const second = createEditor({
            storage: {
                mode: 'local',
                alwaysAskDirectory: false,
            },
        });
        vi.spyOn(second.editor.view, 'coordsAtPos').mockReturnValue({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });

        second.editor.commands.insertFiles({ files: [file] });
        await flushAsyncWork();

        expect(showDirectoryPicker).toHaveBeenCalledTimes(2);

        first.editor.destroy();
        second.editor.destroy();
    });

    it('persists local storage metadata alongside the preview URL in document HTML', async () => {
        const createWritable = vi.fn(async () => ({
            write: vi.fn(),
            close: vi.fn(),
        }));
        const directoryHandle = {
            getFileHandle: vi.fn(async () => ({
                createWritable,
            })),
        } satisfies Partial<FileSystemDirectoryHandle>;
        const showDirectoryPicker = vi.fn().mockResolvedValue(directoryHandle);

        Object.defineProperty(window, 'showDirectoryPicker', {
            configurable: true,
            writable: true,
            value: showDirectoryPicker,
        });
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: vi.fn(() => 'blob:local-preview'),
        });

        const { editor } = createEditor({
            storage: {
                mode: 'local',
            },
        });
        vi.spyOn(editor.view, 'coordsAtPos').mockReturnValue({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });
        const file = new File(['demo'], 'invoice.pdf', { type: 'application/pdf' });

        editor.commands.insertFiles({ files: [file] });
        await flushAsyncWork();

        expect(editor.getHTML()).toContain('data-storage-mode="local"');
        expect(editor.getHTML()).toContain('data-storage-key="invoice.pdf"');

        editor.destroy();
    });

    it('does not open the file picker when the editor is readonly', () => {
        const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
        const { editor } = createEditor();
        editor.setEditable(false);

        expect(editor.commands.openFileDialog()).toBe(false);
        expect(document.querySelectorAll('input[type="file"]')).toHaveLength(0);
        expect(click).not.toHaveBeenCalled();

        editor.destroy();
    });

    it('does not insert uploaded assets when the editor is readonly', async () => {
        const { editor } = createEditor({
            storage: { mode: 'memory' },
        });
        const before = editor.getHTML();
        editor.setEditable(false);

        expect(editor.commands.insertFiles({ files: [new File(['demo'], 'demo.png')] })).toBe(false);
        await flushAsyncWork();
        expect(editor.getHTML()).toBe(before);

        editor.destroy();
    });

    it('shows a temporary upload placeholder with optional progress before replacing it', async () => {
        let finishUpload!: (value: {
            assets: Array<{
                kind: 'image';
                url: string;
                name: string;
                mimeType: string;
                size: number;
            }>;
        }) => void;
        let reportProgress: ((progress: { percent: number }) => void) | undefined;
        const file = new File(['demo'], 'slow.png', { type: 'image/png' });
        const { editor, element } = createEditor({
            storage: {
                mode: 'custom',
                upload: async (_files, ctx) => {
                    reportProgress = (
                        ctx as {
                            onProgress?: (progress: { percent: number }) => void;
                        }
                    ).onProgress;

                    return new Promise((resolve) => {
                        finishUpload = resolve;
                    });
                },
            },
        });
        vi.spyOn(editor.view, 'coordsAtPos').mockReturnValue({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });

        editor.commands.insertFiles({ files: [file] });
        await Promise.resolve();

        const placeholder = element.querySelector('[data-tiptap-upload-placeholder="true"]');
        expect(placeholder?.textContent).toContain('slow.png');
        expect(JSON.stringify(editor.getJSON())).not.toContain('uploadPlaceholder');

        reportProgress?.({ percent: 42 });
        await Promise.resolve();

        expect(
            element.querySelector('[data-tiptap-upload-placeholder-progress="true"]')?.textContent
        ).toContain('42%');

        finishUpload({
            assets: [
                {
                    kind: 'image',
                    url: 'https://cdn.example.com/slow.png',
                    name: 'slow.png',
                    mimeType: 'image/png',
                    size: 4,
                    width: 10,
                    height: 10,
                },
            ],
        });
        await flushAsyncWork();

        expect(element.querySelector('[data-tiptap-upload-placeholder="true"]')).toBeNull();
        expect(editor.getHTML()).toContain('https://cdn.example.com/slow.png');

        editor.destroy();
    });

    it('removes the upload placeholder after upload failure', async () => {
        let failUpload!: (error: Error) => void;
        const onError = vi.fn();
        const file = new File(['demo'], 'broken.pdf', { type: 'application/pdf' });
        const { editor, element } = createEditor({
            storage: {
                mode: 'custom',
                upload: async () =>
                    new Promise((_resolve, reject) => {
                        failUpload = reject;
                    }),
            },
            onError,
        });

        editor.commands.insertFiles({ files: [file] });
        await Promise.resolve();

        expect(element.querySelector('[data-tiptap-upload-placeholder="true"]')).not.toBeNull();

        failUpload(new Error('network timeout'));
        await flushAsyncWork();

        expect(element.querySelector('[data-tiptap-upload-placeholder="true"]')).toBeNull();
        expect(onError).toHaveBeenCalledWith(expect.any(Error));

        editor.destroy();
    });
});
