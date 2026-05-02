import { describe, expect, it, vi } from 'vitest';
import { createFileUploadPlugin } from '../src/extension/FileUploadPlugin';

function getPluginHandlers(plugin: ReturnType<typeof createFileUploadPlugin>) {
    const pluginWithInternals = plugin as ReturnType<typeof createFileUploadPlugin> & {
        props?: {
            handleDrop?: (...args: unknown[]) => boolean;
            handlePaste?: (...args: unknown[]) => boolean;
        };
        spec?: {
            props?: {
                handleDrop?: (...args: unknown[]) => boolean;
                handlePaste?: (...args: unknown[]) => boolean;
            };
        };
    };

    return pluginWithInternals.props ?? pluginWithInternals.spec?.props ?? {};
}

describe('FileUpload ingress', () => {
    it('filters dropped files by allowed MIME types before forwarding them', () => {
        const onDrop = vi.fn();
        const plugin = createFileUploadPlugin({
            ingest: {
                drop: true,
                paste: true,
                allowedMimeTypes: ['image/png'],
            },
            onDrop,
        });
        const handlers = getPluginHandlers(plugin);
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const png = new File(['png'], 'demo.png', { type: 'image/png' });
        const txt = new File(['txt'], 'demo.txt', { type: 'text/plain' });
        const view = {
            posAtCoords: vi.fn(() => ({ pos: 7 })),
        };

        const handled = handlers.handleDrop?.(view, {
            clientX: 10,
            clientY: 20,
            dataTransfer: { files: [png, txt] },
            preventDefault,
            stopPropagation,
        } as DragEvent);

        expect(handled).toBe(true);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
            files: [png],
            position: 7,
            event: expect.objectContaining({
                dataTransfer: { files: [png, txt] },
            }),
        });
    });

    it('keeps HTML paste available for other extensions while still forwarding files', () => {
        const onPaste = vi.fn();
        const plugin = createFileUploadPlugin({
            ingest: {
                drop: true,
                paste: true,
                allowedMimeTypes: ['image/png'],
            },
            onPaste,
        });
        const handlers = getPluginHandlers(plugin);
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const png = new File(['png'], 'demo.png', { type: 'image/png' });
        const view = {
            state: {
                selection: {
                    from: 11,
                },
            },
        };

        const handled = handlers.handlePaste?.(view, {
            clipboardData: {
                files: [png],
                getData: (type: string) => (type === 'text/html' ? '<img src="demo.png" />' : ''),
            },
            preventDefault,
            stopPropagation,
        } as ClipboardEvent);

        expect(handled).toBe(false);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(onPaste).toHaveBeenCalledWith({
            files: [png],
            position: 11,
            htmlContent: '<img src="demo.png" />',
            event: expect.objectContaining({
                clipboardData: expect.objectContaining({
                    files: [png],
                }),
            }),
        });
    });

    it('ignores dropped files while the editor view is readonly', () => {
        const onDrop = vi.fn();
        const plugin = createFileUploadPlugin({
            ingest: {
                drop: true,
                paste: true,
                allowedMimeTypes: ['image/png'],
            },
            onDrop,
        });
        const handlers = getPluginHandlers(plugin);
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const png = new File(['png'], 'demo.png', { type: 'image/png' });
        const view = {
            editable: false,
            posAtCoords: vi.fn(() => ({ pos: 7 })),
        };

        const handled = handlers.handleDrop?.(view, {
            clientX: 10,
            clientY: 20,
            dataTransfer: { files: [png] },
            preventDefault,
            stopPropagation,
        } as DragEvent);

        expect(handled).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();
        expect(onDrop).not.toHaveBeenCalled();
    });

    it('ignores pasted files while the editor view is readonly', () => {
        const onPaste = vi.fn();
        const plugin = createFileUploadPlugin({
            ingest: {
                drop: true,
                paste: true,
                allowedMimeTypes: ['image/png'],
            },
            onPaste,
        });
        const handlers = getPluginHandlers(plugin);
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const png = new File(['png'], 'demo.png', { type: 'image/png' });
        const view = {
            editable: false,
            state: {
                selection: {
                    from: 11,
                },
            },
        };

        const handled = handlers.handlePaste?.(view, {
            clipboardData: {
                files: [png],
                getData: vi.fn(() => ''),
            },
            preventDefault,
            stopPropagation,
        } as ClipboardEvent);

        expect(handled).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();
        expect(onPaste).not.toHaveBeenCalled();
    });
});
