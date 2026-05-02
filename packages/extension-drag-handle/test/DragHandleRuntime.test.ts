import { getExtensionField } from '@tiptap/core';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DragHandle } from '../src/extension/DragHandleExtension';
import { DRAG_HANDLE_MIME } from '../src/utils/drag';
import { createDragHandlePlugin } from '../src/extension/DragHandlePlugin';
import type { DragHandleOptions } from '../src/types';

const rendererState = vi.hoisted(() => ({
    instances: [] as Array<{
        component: unknown;
        config: unknown;
        updateProps: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    }>,
}));

vi.mock('@tiptap/react', () => ({
    ReactRenderer: class MockReactRenderer {
        public updateProps = vi.fn();
        public destroy = vi.fn();

        constructor(
            public component: unknown,
            public config: unknown
        ) {
            rendererState.instances.push(this);
        }
    },
}));

type EditorListener = (...args: unknown[]) => void;

function createFakeEditor() {
    const listeners = new Map<string, Set<EditorListener>>();
    const editorDom = document.createElement('div');
    editorDom.setAttribute('contenteditable', 'true');
    document.body.appendChild(editorDom);

        return {
            isEditable: true,
            view: {
                dom: editorDom,
                posAtCoords: vi.fn(() => null),
                state: {
                    doc: {},
                    tr: {
                    setMeta: vi.fn(() => ({})),
                },
            },
            dispatch: vi.fn(),
        },
        on: vi.fn((event: string, handler: EditorListener) => {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }

            listeners.get(event)?.add(handler);
        }),
        off: vi.fn((event: string, handler: EditorListener) => {
            listeners.get(event)?.delete(handler);
        }),
        emit(event: string, ...args: unknown[]) {
            listeners.get(event)?.forEach((handler) => handler(...args));
        },
        contentComponent: undefined as
            | {
                  setRenderer: () => void;
                  removeRenderer: () => void;
              }
            | undefined,
    };
}

function getAddProseMirrorPlugins(editor: ReturnType<typeof createFakeEditor>, options?: DragHandleOptions) {
    const extension = DragHandle.configure(options ?? {});

    return getExtensionField(extension, 'addProseMirrorPlugins', {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor: editor as never,
        type: null,
        parent: () => [],
    });
}

function getHandleDomEvents(plugin: ReturnType<typeof createDragHandlePlugin>) {
    const pluginWithInternals = plugin as ReturnType<typeof createDragHandlePlugin> & {
        props?: { handleDOMEvents?: Record<string, (...args: unknown[]) => boolean> };
        spec?: { props?: { handleDOMEvents?: Record<string, (...args: unknown[]) => boolean> } };
    };

    return pluginWithInternals.props?.handleDOMEvents ?? pluginWithInternals.spec?.props?.handleDOMEvents;
}

function getStateHandlers(plugin: ReturnType<typeof createDragHandlePlugin>) {
    const pluginWithInternals = plugin as ReturnType<typeof createDragHandlePlugin> & {
        spec?: {
            state?: {
                init?: () => unknown;
                apply?: (tr: unknown, value: unknown) => unknown;
            };
        };
    };

    return pluginWithInternals.spec?.state;
}

describe('DragHandle runtime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        rendererState.instances.length = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('cancels delayed ReactRenderer creation when the editor is destroyed first', () => {
        const editor = createFakeEditor();
        const addProseMirrorPlugins = getAddProseMirrorPlugins(editor);

        addProseMirrorPlugins();
        editor.emit('destroy');
        vi.runAllTimers();

        expect(rendererState.instances).toHaveLength(0);
    });

    it('waits until EditorContent has registered contentComponent before creating the renderer', () => {
        const editor = createFakeEditor();
        const addProseMirrorPlugins = getAddProseMirrorPlugins(editor);

        addProseMirrorPlugins();
        vi.advanceTimersByTime(32);

        expect(rendererState.instances).toHaveLength(0);

        editor.contentComponent = {
            setRenderer: vi.fn(),
            removeRenderer: vi.fn(),
        };

        vi.advanceTimersByTime(32);

        expect(rendererState.instances).toHaveLength(1);
    });

    it('registers drag listeners and consumes drag DOM handlers under the 1.0 API', () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        const preventDefault = vi.fn();
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                drag: {
                    opacity: 0.35,
                },
            } as DragHandleOptions,
            onStateChange: vi.fn(),
        });
        const handleDOMEvents = getHandleDomEvents(plugin);
        const dragover = handleDOMEvents?.dragover;
        const drop = handleDOMEvents?.drop;
        const target = document.createElement('div');
        const dataTransfer = {
            types: [DRAG_HANDLE_MIME],
            getData: vi.fn((key: string) => {
                if (key === DRAG_HANDLE_MIME) {
                    return 'true';
                }

                return '';
            }),
        };

        expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function), true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function), true);
        expect(
            dragover?.(
                editor.view as never,
                {
                    dataTransfer,
                    preventDefault,
                    target,
                } as DragEvent
            )
        ).toBe(true);
        expect(
            drop?.(
                editor.view as never,
                {
                    dataTransfer,
                    preventDefault,
                    target,
                } as DragEvent
            )
        ).toBe(true);
        expect(preventDefault).toHaveBeenCalled();
    });

    it('does not register drag listeners or consume drag DOM handlers when drag.enabled is false', () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        const preventDefault = vi.fn();
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                drag: {
                    enabled: false,
                },
            } as DragHandleOptions,
            onStateChange: vi.fn(),
        });
        const handleDOMEvents = getHandleDomEvents(plugin);
        const dragover = handleDOMEvents?.dragover;
        const drop = handleDOMEvents?.drop;
        const target = document.createElement('div');
        const dataTransfer = {
            types: [DRAG_HANDLE_MIME],
            getData: vi.fn(() => 'true'),
        };

        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
            'dragover',
            expect.any(Function),
            true
        );
        expect(addEventListenerSpy).not.toHaveBeenCalledWith('drop', expect.any(Function), true);
        expect(
            dragover?.(
                editor.view as never,
                {
                    dataTransfer,
                    preventDefault,
                    target,
                } as DragEvent
            )
        ).toBe(false);
        expect(
            drop?.(
                editor.view as never,
                {
                    dataTransfer,
                    preventDefault,
                    target,
                } as DragEvent
            )
        ).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
    });

    it('does not consume drag DOM handlers when the editor is readonly', () => {
        const preventDefault = vi.fn();
        const editor = createFakeEditor();
        editor.isEditable = false;
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                drag: {
                    opacity: 0.35,
                },
            } as DragHandleOptions,
            onStateChange: vi.fn(),
        });
        const handleDOMEvents = getHandleDomEvents(plugin);
        const target = document.createElement('div');
        const dataTransfer = {
            types: [DRAG_HANDLE_MIME],
            getData: vi.fn((key: string) => {
                if (key === DRAG_HANDLE_MIME) {
                    return 'true';
                }

                return '';
            }),
        };

        expect(
            handleDOMEvents?.dragenter?.(
                editor.view as never,
                { dataTransfer, preventDefault, target } as DragEvent
            )
        ).toBe(false);
        expect(
            handleDOMEvents?.dragover?.(
                editor.view as never,
                { dataTransfer, preventDefault, target } as DragEvent
            )
        ).toBe(false);
        expect(
            handleDOMEvents?.drop?.(
                editor.view as never,
                { dataTransfer, preventDefault, target } as DragEvent
            )
        ).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
    });

    it('does not open the insert menu from text input when insertMenu.trigger is false', () => {
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {
                insertMenu: {
                    trigger: false,
                },
            } as DragHandleOptions,
            onStateChange: vi.fn(),
        });
        const pluginWithInternals = plugin as ReturnType<typeof createDragHandlePlugin> & {
            props?: { handleTextInput?: (...args: unknown[]) => boolean };
            spec?: { props?: { handleTextInput?: (...args: unknown[]) => boolean } };
        };
        const handleTextInput =
            pluginWithInternals.props?.handleTextInput ?? pluginWithInternals.spec?.props?.handleTextInput;

        const handled = handleTextInput?.(
            {
                state: {
                    doc: {
                        resolve: vi.fn(() => ({
                            parent: {
                                isTextblock: true,
                                content: { size: 0 },
                            },
                        })),
                    },
                },
                dispatch: vi.fn(),
                coordsAtPos: vi.fn(() => ({
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                })),
            } as never,
            1,
            1,
            '/'
        );

        expect(handled).toBe(false);
    });

    it('does not reschedule redundant hide timers while one is already pending', () => {
        const editor = createFakeEditor();
        const plugin = createDragHandlePlugin({
            editor: editor as never,
            options: {} as DragHandleOptions,
            onStateChange: vi.fn(),
        });
        const handleDOMEvents = getHandleDomEvents(plugin);
        const mouseleave = handleDOMEvents?.mouseleave;
        const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

        mouseleave?.(editor.view as never, {
            clientX: 0,
            clientY: 0,
        } as MouseEvent);
        mouseleave?.(editor.view as never, {
            clientX: 0,
            clientY: 0,
        } as MouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    });

    it('emits a single consolidated state update for multi-meta transactions', () => {
        const onStateChange = vi.fn();
        const plugin = createDragHandlePlugin({
            editor: createFakeEditor() as never,
            options: {} as DragHandleOptions,
            onStateChange,
        });
        const stateHandlers = getStateHandlers(plugin);
        const initialState = stateHandlers?.init?.();
        const commandRange = { from: 3, to: 4 };

        const nextState = stateHandlers?.apply?.(
            {
                docChanged: false,
                getMeta: (key: string) => {
                    if (key === 'lockDragHandle') {
                        return true;
                    }

                    if (key === 'openInsertMenu') {
                        return { commandRange };
                    }

                    return undefined;
                },
            },
            initialState
        ) as {
            locked: boolean;
            insertMenuCommandRange: { from: number; to: number } | null;
        };

        expect(onStateChange).toHaveBeenCalledTimes(1);
        expect(nextState).toMatchObject({
            locked: true,
            insertMenuCommandRange: commandRange,
        });
        expect(onStateChange).toHaveBeenCalledWith(nextState);
    });
});
