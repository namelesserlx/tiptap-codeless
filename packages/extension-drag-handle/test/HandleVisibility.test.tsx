import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DragHandle } from '../src/components/DragHandle';
import { GripHandle } from '../src/components/GripHandle';
import { InsertHandle } from '../src/components/InsertHandle';
import { DragHandleProvider } from '../src/contexts/DragHandleContext';
import { InsertMenuProvider } from '../src/contexts/InsertMenuContext';
import type { CurrentNodeInfo, DragHandleOptions, DragHandlePluginState } from '../src/types';
import { calculateHandlePosition } from '../src/utils/position';

vi.mock('../src/utils/position', async () => {
    const actual = await vi.importActual<typeof import('../src/utils/position')>(
        '../src/utils/position'
    );

    return {
        ...actual,
        calculateHandlePosition: vi.fn(),
    };
});

function createFakeEditor() {
    return {
        isEditable: true,
        view: {
            dom: document.createElement('div'),
            state: {
                tr: {
                    setMeta: vi.fn(() => ({})),
                },
            },
            dispatch: vi.fn(),
        },
        on: vi.fn(),
        off: vi.fn(),
    };
}

function createNodeInfo(isEmpty: boolean): CurrentNodeInfo {
    return {
        node: {
            type: {
                name: isEmpty ? 'paragraph' : 'heading',
            },
        } as never,
        pos: 1,
        dom: document.createElement('div'),
        isEmpty,
        rect: new DOMRect(12, 24, 320, 48),
    };
}

function renderWithProvider(
    ui: React.ReactElement,
    {
        pluginState,
        options,
        hostElement,
    }: {
        pluginState: DragHandlePluginState;
        options?: DragHandleOptions;
        hostElement?: HTMLElement | null;
    }
) {
    const editor = createFakeEditor();

    return render(
        <DragHandleProvider
            editor={editor as never}
            options={(options ?? {}) as never}
            pluginState={pluginState}
            hostElement={hostElement ?? document.body}
        >
            {ui}
        </DragHandleProvider>
    );
}

describe('Drag handle visibility gating', () => {
    const mockedCalculateHandlePosition = vi.mocked(calculateHandlePosition);

    beforeEach(() => {
        mockedCalculateHandlePosition.mockReturnValue({
            left: 10,
            top: 20,
            visible: false,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('does not mount the grip handle when the calculated position is not visible', () => {
        const { container } = renderWithProvider(<GripHandle />, {
            pluginState: {
                locked: false,
                currentNode: createNodeInfo(false),
                isDragging: false,
                isVisible: true,
                insertMenuCommandRange: null,
            },
        });

        expect(container.querySelector('[data-drag-handle]')).toBeNull();
    });

    it('does not mount the insert handle when the calculated position is not visible', () => {
        const { container } = renderWithProvider(
            <InsertMenuProvider>
                <InsertHandle />
            </InsertMenuProvider>,
            {
                pluginState: {
                    locked: false,
                    currentNode: createNodeInfo(true),
                    isDragging: false,
                    isVisible: true,
                    insertMenuCommandRange: null,
                },
            }
        );

        expect(container.querySelector('[data-drag-handle]')).toBeNull();
    });

    it('renders custom drag and insert icons from handle.icons', () => {
        mockedCalculateHandlePosition.mockReturnValue({
            left: 10,
            top: 20,
            visible: true,
        });

        const dragIcon = <span data-testid="drag-icon">Drag icon</span>;
        const insertIcon = <span data-testid="insert-icon">Insert icon</span>;

        const dragView = renderWithProvider(<GripHandle />, {
            options: {
                handle: {
                    icons: {
                        drag: dragIcon,
                        insert: insertIcon,
                    },
                },
            },
            pluginState: {
                locked: false,
                currentNode: createNodeInfo(false),
                isDragging: false,
                isVisible: true,
                insertMenuCommandRange: null,
            },
        });

        expect(dragView.getByTestId('drag-icon')).toBeInTheDocument();

        cleanup();

        const insertView = renderWithProvider(
            <InsertMenuProvider>
                <InsertHandle />
            </InsertMenuProvider>,
            {
                options: {
                    handle: {
                        icons: {
                            drag: dragIcon,
                            insert: insertIcon,
                        },
                    },
                },
                pluginState: {
                    locked: false,
                    currentNode: createNodeInfo(true),
                    isDragging: false,
                    isVisible: true,
                    insertMenuCommandRange: null,
                },
            }
        );

        expect(insertView.getByTestId('insert-icon')).toBeInTheDocument();
    });

    it('falls back to the drag handle for empty nodes when insertMenu is disabled', () => {
        mockedCalculateHandlePosition.mockReturnValue({
            left: 10,
            top: 20,
            visible: true,
        });

        const dragIcon = <span data-testid="drag-icon">Drag icon</span>;
        const insertIcon = <span data-testid="insert-icon">Insert icon</span>;

        const view = renderWithProvider(<DragHandle />, {
            options: {
                handle: {
                    icons: {
                        drag: dragIcon,
                        insert: insertIcon,
                    },
                },
                insertMenu: {
                    enabled: false,
                },
            },
            pluginState: {
                locked: false,
                currentNode: createNodeInfo(true),
                isDragging: false,
                isVisible: true,
                insertMenuCommandRange: null,
            },
            hostElement: document.body,
        });

        expect(view.getByTestId('drag-icon')).toBeInTheDocument();
        expect(view.queryByTestId('insert-icon')).toBeNull();
    });
});
