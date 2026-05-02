import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import {
    applyTransactionMetaToPluginState,
    createInitialPluginState,
    hideHandleState,
    showHandleForNode,
    syncCurrentNode,
} from '@/runtime/pluginState';
import { isPointInNodeSafeZone } from '@/runtime/visibility';
import type { CurrentNodeInfo, DragHandleOptions, DragHandlePluginState } from '../types';
import { DRAG_HANDLE_MIME, handleDrop } from '../utils/drag';
import { getNodeInfoFromCoords, getNodeInfoFromPos, shouldShowHandle } from '../utils/node';

export const dragHandlePluginKey = new PluginKey<DragHandlePluginState>('dragHandle');

export interface DragHandlePluginProps {
    editor: Editor;
    options: DragHandleOptions;
    onStateChange: (state: DragHandlePluginState) => void;
}

export function createDragHandlePlugin({
    editor,
    options,
    onStateChange,
}: DragHandlePluginProps): Plugin {
    const dragEnabled = options.drag?.enabled !== false;
    const insertMenuEnabled = options.insertMenu?.enabled !== false;
    let currentState: DragHandlePluginState = createInitialPluginState();

    let rafId: number | null = null;
    let pendingMouseMove:
        | {
              view: EditorView;
              x: number;
              y: number;
          }
        | null = null;
    let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let showTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let pendingShowNodePos: number | null = null;

    let lastDragoverTarget: Element | null = null;
    let lastDragoverResult: boolean | null = null;

    const cancelScheduledHide = () => {
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
    };

    const cancelScheduledShow = () => {
        if (showTimeoutId) {
            clearTimeout(showTimeoutId);
            showTimeoutId = null;
        }
        pendingShowNodePos = null;
    };

    const commitState = (nextState: DragHandlePluginState) => {
        if (nextState === currentState) {
            return;
        }

        currentState = nextState;
        onStateChange(currentState);
    };

    const emitNodeChange = (nodeInfo: CurrentNodeInfo | null) => {
        options.events?.onNodeChange?.(nodeInfo);
    };

    const hide = () => {
        cancelScheduledShow();

        const previousState = currentState;
        const nextState = hideHandleState(currentState);
        commitState(nextState);

        if (nextState !== previousState) {
            emitNodeChange(null);
        }
    };

    const show = (nodeInfo: CurrentNodeInfo) => {
        cancelScheduledHide();
        cancelScheduledShow();

        const shouldShow = shouldShowHandle(nodeInfo.node, options.nodes);
        if (!shouldShow) {
            return;
        }

        const previousState = currentState;
        const nextState = showHandleForNode(currentState, nodeInfo);
        commitState(nextState);

        if (nextState !== previousState) {
            emitNodeChange(nodeInfo);
        }
    };

    const scheduleShow = (nodeInfo: CurrentNodeInfo) => {
        cancelScheduledHide();

        const delay = options.handle?.hoverDelay ?? 0;

        if (pendingShowNodePos === nodeInfo.pos) {
            return;
        }

        if (delay <= 0) {
            show(nodeInfo);
            return;
        }

        cancelScheduledShow();
        pendingShowNodePos = nodeInfo.pos;
        showTimeoutId = setTimeout(() => {
            showTimeoutId = null;
            pendingShowNodePos = null;
            show(nodeInfo);
        }, delay);
    };

    const scheduleHide = () => {
        cancelScheduledShow();
        if (hideTimeoutId) {
            return;
        }

        const delay = options.handle?.hideDelay ?? 100;
        hideTimeoutId = setTimeout(hide, delay);
    };

    const isInSafeZone = (x: number, y: number): boolean =>
        isPointInNodeSafeZone(currentState.currentNode, x, y);

    const handleMouseMove = (view: EditorView, x: number, y: number) => {
        if (currentState.locked || currentState.isDragging) {
            return;
        }

        if (!editor.isEditable) {
            hide();
            return;
        }

        if (isInSafeZone(x, y)) {
            cancelScheduledHide();
            return;
        }

        const nodeInfo = getNodeInfoFromCoords(view, x, y, {
            fallbackDirection: 'right',
            fallbackDistance: 50,
        });

        if (nodeInfo) {
            if (currentState.currentNode?.pos !== nodeInfo.pos) {
                scheduleShow(nodeInfo);
            }
        } else {
            scheduleHide();
        }
    };

    const isNonEditableNodeInEditor = (element: Element, editorView: EditorView): boolean => {
        const editorDom = editorView.dom;

        if (!editorDom.contains(element) || element === editorDom) {
            return false;
        }

        let current: Element | null = element;

        while (current && current !== editorDom) {
            const contentEditable = current.getAttribute('contenteditable');

            if (contentEditable === 'true') {
                return false;
            }

            if (contentEditable === 'false') {
                return true;
            }

            current = current.parentElement;
        }

        return editorDom.getAttribute('contenteditable') !== 'true';
    };

    const globalDragoverHandler = (event: DragEvent) => {
        const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
        if (!isDragHandle) return;

        const target = event.target as Element | null;
        if (!target) return;

        let shouldHandle = false;
        if (target === lastDragoverTarget && lastDragoverResult !== null) {
            shouldHandle = lastDragoverResult;
        } else {
            shouldHandle = isNonEditableNodeInEditor(target, editor.view);
            lastDragoverTarget = target;
            lastDragoverResult = shouldHandle;
        }

        if (shouldHandle) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        }
    };

    const globalDropHandler = (_event: DragEvent) => {
        // 全局监听器用于确保 drop 事件能够被捕获
    };

    if (dragEnabled) {
        document.addEventListener('dragover', globalDragoverHandler, true);
        document.addEventListener('drop', globalDropHandler, true);
    }

    return new Plugin({
        key: dragHandlePluginKey,

        state: {
            init() {
                return currentState;
            },

            apply(tr) {
                if (tr.getMeta('cancelDragHandleHide')) {
                    cancelScheduledHide();
                }

                if (tr.getMeta('scheduleDragHandleHide')) {
                    scheduleHide();
                }

                const previousState = currentState;
                let nextState = applyTransactionMetaToPluginState(currentState, tr);

                if (nextState.isDragging && !previousState.isDragging) {
                    lastDragoverTarget = null;
                    lastDragoverResult = null;
                }

                if (previousState.currentNode && !nextState.currentNode) {
                    emitNodeChange(null);
                }

                if (tr.docChanged && nextState.currentNode) {
                    const newPos = tr.mapping.map(nextState.currentNode.pos);
                    const nodeInfo = getNodeInfoFromPos(editor.view, newPos);

                    if (nodeInfo) {
                        nextState = syncCurrentNode(nextState, nodeInfo);
                    } else {
                        const hiddenState = hideHandleState(nextState);
                        if (hiddenState !== nextState) {
                            emitNodeChange(null);
                        }
                        nextState = hiddenState;
                    }
                }

                commitState(nextState);

                return currentState;
            },
        },

        view() {
            return {
                update(view, prevState) {
                    if (!editor.isEditable) {
                        hide();
                        return;
                    }

                    if (!view.state.doc.eq(prevState.doc) && currentState.currentNode) {
                        const { from } = view.state.selection;
                        let nodeInfo = getNodeInfoFromPos(view, from);

                        if (!nodeInfo) {
                            const mappedPos = view.state.tr.mapping.map(currentState.currentNode.pos);
                            nodeInfo = getNodeInfoFromPos(view, mappedPos);
                        }

                        if (!nodeInfo) {
                            nodeInfo = getNodeInfoFromPos(view, currentState.currentNode.pos);
                        }

                        if (nodeInfo) {
                            commitState(syncCurrentNode(currentState, nodeInfo));
                        }
                    }
                },

                destroy() {
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                    pendingMouseMove = null;
                    cancelScheduledHide();
                    cancelScheduledShow();
                    if (dragEnabled) {
                        document.removeEventListener('dragover', globalDragoverHandler, true);
                        document.removeEventListener('drop', globalDropHandler, true);
                    }
                },
            };
        },

        props: {
            handleTextInput(view, from, to, text) {
                if (!insertMenuEnabled) {
                    return false;
                }

                if (!editor.isEditable) {
                    return false;
                }

                const existingRange = currentState.insertMenuCommandRange;
                if (existingRange && from === to && from === existingRange.to) {
                    const tr = view.state.tr.insertText(text, from, to);
                    tr.setMeta('updateInsertMenuCommandRange', {
                        commandRange: {
                            from: existingRange.from,
                            to: existingRange.to + text.length,
                        },
                    });
                    view.dispatch(tr);
                    return true;
                }

                const trigger = options.insertMenu?.trigger ?? '/';
                if (trigger === false) {
                    return false;
                }

                const isTrigger =
                    typeof trigger === 'string' ? text === trigger : (trigger as RegExp).test(text);

                if (!isTrigger || from !== to) {
                    return false;
                }

                const $from = view.state.doc.resolve(from);
                const parent = $from.parent;
                const isEmptyTextblock = parent.isTextblock && parent.content.size === 0;
                if (!isEmptyTextblock) {
                    return false;
                }

                const nodeInfo = getNodeInfoFromPos(view, from);
                if (!nodeInfo || !nodeInfo.isEmpty) {
                    return false;
                }

                const coords = view.coordsAtPos(from);
                const triggerRect = new DOMRect(
                    coords.left,
                    coords.top,
                    Math.max(1, coords.right - coords.left),
                    Math.max(1, coords.bottom - coords.top)
                );

                const commandRange = { from, to: from + text.length };
                const tr = view.state.tr.insertText(text, from, to);
                tr.setMeta('openInsertMenu', { triggerRect, commandRange, triggerText: text });
                view.dispatch(tr);

                commitState({
                    ...syncCurrentNode(currentState, nodeInfo),
                    insertMenuCommandRange: commandRange,
                });

                return true;
            },
            handleDOMEvents: {
                mousemove(view, event) {
                    pendingMouseMove = {
                        view,
                        x: event.clientX,
                        y: event.clientY,
                    };

                    if (!rafId) {
                        rafId = requestAnimationFrame(() => {
                            const nextMouseMove = pendingMouseMove;

                            rafId = null;
                            pendingMouseMove = null;

                            if (!nextMouseMove) {
                                return;
                            }

                            handleMouseMove(
                                nextMouseMove.view,
                                nextMouseMove.x,
                                nextMouseMove.y
                            );
                        });
                    }

                    return false;
                },

                mouseleave(_view, event) {
                    if (currentState.locked || currentState.isDragging) {
                        return false;
                    }

                    if (isInSafeZone(event.clientX, event.clientY)) {
                        return false;
                    }

                    scheduleHide();
                    return false;
                },

                keydown(view) {
                    if (currentState.locked) {
                        return false;
                    }

                    if (view.hasFocus()) {
                        hide();
                    }

                    return false;
                },

                dragenter(_view, event) {
                    if (!dragEnabled || !editor.isEditable) {
                        return false;
                    }

                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (!isDragHandle) {
                        return false;
                    }

                    event.preventDefault();
                    if (event.dataTransfer) {
                        event.dataTransfer.dropEffect = 'move';
                    }
                    return true;
                },

                dragover(view, event) {
                    if (!dragEnabled || !editor.isEditable) {
                        return false;
                    }

                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (!isDragHandle) {
                        return false;
                    }

                    const target = event.target as Element | null;
                    let isNonEditable = false;
                    if (target && target !== lastDragoverTarget) {
                        isNonEditable = isNonEditableNodeInEditor(target, view);
                        lastDragoverTarget = target;
                        lastDragoverResult = isNonEditable;
                    } else if (target === lastDragoverTarget && lastDragoverResult !== null) {
                        isNonEditable = lastDragoverResult;
                    }

                    if (isNonEditable) {
                        return false;
                    }

                    event.preventDefault();
                    if (event.dataTransfer) {
                        event.dataTransfer.dropEffect = 'move';
                    }
                    return true;
                },

                dragleave() {
                    return false;
                },

                drop(_view, event) {
                    if (!dragEnabled || !editor.isEditable) {
                        return false;
                    }

                    if (currentState.isDragging) {
                        commitState({
                            ...currentState,
                            isDragging: false,
                        });
                    }

                    return handleDrop(editor, event, null);
                },

                dragend(_view, event) {
                    if (!dragEnabled || !editor.isEditable) {
                        return false;
                    }

                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (isDragHandle) {
                        lastDragoverTarget = null;
                        lastDragoverResult = null;
                    }
                    return false;
                },
            },
        },
    });
}

export function lockDragHandle(editor: Editor, locked: boolean): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', locked));
}

export function hideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('hideDragHandle', true));
}

export function cancelHideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('cancelDragHandleHide', true));
}

export function scheduleHideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('scheduleDragHandleHide', true));
}
