import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { CurrentNodeInfo, DragHandleOptions, DragHandlePluginState } from '../types';
import { DRAG_HANDLE_MIME, handleDrop } from '../utils/drag';
import { getNodeInfoFromCoords, getNodeInfoFromPos, shouldShowHandle } from '../utils/node';
import { throttle } from '../utils/position';

export const dragHandlePluginKey = new PluginKey<DragHandlePluginState>('dragHandle');

export interface DragHandlePluginProps {
    editor: Editor;
    options: DragHandleOptions;
    onStateChange: (state: DragHandlePluginState) => void;
}

/**
 * 创建拖拽手柄插件
 */
export function createDragHandlePlugin({
    editor,
    options,
    onStateChange,
}: DragHandlePluginProps): Plugin {
    let currentState: DragHandlePluginState = {
        locked: false,
        currentNode: null,
        isDragging: false,
        isVisible: false,
        insertMenuCommandRange: null,
    };

    let rafId: number | null = null;
    let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // 用于缓存 dragover 事件中的 DOM 检查结果，减少重复计算
    let lastDragoverTarget: Element | null = null;
    let lastDragoverResult: boolean | null = null;

    const cancelScheduledHide = () => {
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
    };

    const updateState = (partial: Partial<DragHandlePluginState>) => {
        currentState = { ...currentState, ...partial };
        onStateChange(currentState);
    };

    const hide = () => {
        if (currentState.locked || currentState.isDragging) {
            return;
        }

        updateState({
            currentNode: null,
            isVisible: false,
        });

        options.onNodeChange?.(null);
    };

    const show = (nodeInfo: CurrentNodeInfo) => {
        cancelScheduledHide();

        // 检查是否应该显示
        const shouldShow = shouldShowHandle(
            nodeInfo.node,
            options?.excludeNodes,
            options?.includeOnlyNodes
        );
        if (!shouldShow) {
            return;
        }

        updateState({
            currentNode: nodeInfo,
            isVisible: true,
        });

        options.onNodeChange?.(nodeInfo);
    };

    const scheduleHide = () => {
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
        }

        // 默认延迟 300ms，给用户足够时间移动到手柄
        const delay = options?.handleStyle?.hideDelay ?? 300;
        hideTimeoutId = setTimeout(hide, delay);
    };

    /**
     * 检查坐标是否在当前节点的"安全区域"内
     * 安全区域 = 节点左侧 100px 范围 + 节点垂直范围（上下各扩展 20px 容差）
     */
    const isInSafeZone = (x: number, y: number): boolean => {
        if (!currentState.currentNode) return false;
        // 使用实时的 DOM rect，而不是缓存的 rect
        const dom = currentState.currentNode.dom;
        if (!dom || !dom.getBoundingClientRect) return false;
        const rect = dom.getBoundingClientRect();
        const safeLeft = rect.left - 100;
        const verticalTolerance = 20;
        return (
            x >= safeLeft &&
            x <= rect.right &&
            y >= rect.top - verticalTolerance &&
            y <= rect.bottom + verticalTolerance
        );
    };

    // 处理鼠标移动（节流）
    const handleMouseMove = throttle((view: EditorView, x: number, y: number) => {
        if (currentState.locked || currentState.isDragging) {
            return;
        }

        if (!editor.isEditable) {
            hide();
            return;
        }

        // 如果鼠标在当前节点的"安全区域"内（包括手柄区域），保持显示
        if (isInSafeZone(x, y)) {
            cancelScheduledHide();
            return;
        }

        // 从坐标获取节点信息（如果直接获取失败，会自动向右查找）
        const nodeInfo = getNodeInfoFromCoords(view, x, y, {
            fallbackDirection: 'right',
            fallbackDistance: 50,
        });

        if (nodeInfo) {
            // 检查是否是不同的节点
            if (currentState.currentNode?.pos !== nodeInfo.pos) {
                show(nodeInfo);
            }
        } else {
            scheduleHide();
        }
    }, 55);

    /**
     * 检查元素是否在编辑器内但无法通过插件层正常处理
     *
     * 这种情况通常发生在 NodeView 内的元素上（如 React 渲染的原子节点）。
     * 当拖拽在这些元素上时，插件层的 dragover 事件可能无法正常触发，因为
     * 这些元素通常不在可编辑区域内（contentEditable="false"）。
     *
     * 判断逻辑（通用且不依赖具体的 DOM 结构或类名）：
     * 1. 元素必须在编辑器容器内
     * 2. 元素不能是编辑器容器本身（编辑器容器由插件层正常处理）
     * 3. 从元素向上遍历，检查是否在可编辑区域内
     *    - 如果找到 contentEditable="true" 的父元素，说明在可编辑区域内，插件层可以处理
     *    - 如果找到 contentEditable="false" 的父元素，说明在 NodeView 内，需要全局处理
     *    - contentEditable 是标准的 HTML 属性，这是通用的判断方式，不依赖特定库的实现
     */
    const isNonEditableNodeInEditor = (element: Element, editorView: EditorView): boolean => {
        const editorDom = editorView.dom;

        // 1. 必须在编辑器容器内
        if (!editorDom.contains(element)) {
            return false;
        }

        // 2. 不能是编辑器容器本身（编辑器容器由插件层正常处理）
        if (element === editorDom) {
            return false;
        }

        // 3. 从元素向上遍历父元素链，查找 contentEditable 属性
        // contentEditable 是标准的 HTML 属性，用于标识元素是否可编辑
        // 这是通用的判断方式，不依赖任何特定的库或实现细节
        let current: Element | null = element;

        while (current && current !== editorDom) {
            const contentEditable = current.getAttribute('contenteditable');

            // 如果找到 contentEditable="true"，说明在可编辑区域内
            // 插件层可以正常处理，不需要全局处理
            if (contentEditable === 'true') {
                return false;
            }

            // 如果找到 contentEditable="false"，说明这是非可编辑区域
            // 通常是 NodeView 的包装器（如 React NodeView、Vue NodeView 等）
            // 需要全局处理以确保 drop 事件可以触发
            if (contentEditable === 'false') {
                return true;
            }

            // 如果 contentEditable 是 null（未设置），继续向上查找
            current = current.parentElement;
        }

        // 4. 如果遍历到编辑器容器都没有找到明确的 contentEditable 设置
        // 检查编辑器容器本身是否可编辑
        const editorContentEditable = editorDom.getAttribute('contenteditable');
        if (editorContentEditable === 'true') {
            // 编辑器是可编辑的，但元素没有明确的 contentEditable 设置
            // 默认认为在可编辑区域内，由插件层处理
            return false;
        }

        // 5. 保守策略：如果无法确定，默认需要全局处理
        // 这确保了在任何情况下 drop 事件都能正常触发
        return true;
    };

    // 全局 dragover 监听器（确保在原子节点上也能触发 drop）
    // 当鼠标在原子节点的 NodeView 上时，插件层的 dragover 可能无法触发，需要全局处理
    const globalDragoverHandler = (event: DragEvent) => {
        const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
        if (!isDragHandle) return;

        const target = event.target as Element;
        if (!target) return;

        // 使用缓存来减少 DOM 检查的开销
        // 如果目标元素和上次相同，直接使用缓存结果
        let shouldHandle = false;
        if (target === lastDragoverTarget && lastDragoverResult !== null) {
            // 目标元素相同，使用缓存结果（避免重复的 DOM 遍历）
            shouldHandle = lastDragoverResult;
        } else {
            // 目标元素变化了，重新检查并更新缓存
            shouldHandle = isNonEditableNodeInEditor(target, editor.view);
            lastDragoverTarget = target;
            lastDragoverResult = shouldHandle;
        }

        // 关键：必须每次都调用 preventDefault 才能触发 drop 事件
        // 但我们只在确定需要处理时才设置 dropEffect
        if (shouldHandle) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        }
    };

    // 全局 drop 监听器
    const globalDropHandler = (_event: DragEvent) => {
        // 全局监听器用于确保 drop 事件能够被捕获
    };
    document.addEventListener('dragover', globalDragoverHandler, true);
    document.addEventListener('drop', globalDropHandler, true);

    return new Plugin({
        key: dragHandlePluginKey,

        state: {
            init() {
                return currentState;
            },

            apply(tr) {
                // 取消/重新安排隐藏（来自组件层的 hover 等）
                const cancelHideMeta = tr.getMeta('cancelDragHandleHide');
                if (cancelHideMeta) {
                    cancelScheduledHide();
                }

                const scheduleHideMeta = tr.getMeta('scheduleDragHandleHide');
                if (scheduleHideMeta) {
                    scheduleHide();
                }

                // 处理锁定状态
                const lockMeta = tr.getMeta('lockDragHandle');
                if (lockMeta !== undefined) {
                    updateState({ locked: lockMeta });
                }

                // 处理隐藏请求
                const hideMeta = tr.getMeta('hideDragHandle');
                if (hideMeta) {
                    hide();
                }

                // 处理拖拽状态
                const draggingMeta = tr.getMeta('dragHandleDragging');
                if (draggingMeta !== undefined) {
                    updateState({ isDragging: draggingMeta });
                    // 拖拽开始时重置缓存
                    if (draggingMeta) {
                        // 清除 dragover 缓存
                        lastDragoverTarget = null;
                        lastDragoverResult = null;
                    }
                }

                // 由输入命令打开菜单时，记录命令范围
                const openInsertMenuMeta = tr.getMeta('openInsertMenu');
                if (openInsertMenuMeta?.commandRange) {
                    updateState({ insertMenuCommandRange: openInsertMenuMeta.commandRange });
                }

                // 更新命令范围（用户继续输入）
                const updateCommandMeta = tr.getMeta('updateInsertMenuCommandRange');
                if (updateCommandMeta?.commandRange) {
                    updateState({ insertMenuCommandRange: updateCommandMeta.commandRange });
                }

                // 清理命令范围（菜单关闭/选择后）
                const clearCommandMeta = tr.getMeta('clearInsertMenuCommandRange');
                if (clearCommandMeta) {
                    updateState({ insertMenuCommandRange: null });
                }

                // 文档变化时更新节点信息
                // 注意：即使位置没变，节点类型也可能改变（如 paragraph 被替换成 codeBlock）
                // 所以需要重新获取节点信息以更新 isEmpty 等属性
                if (tr.docChanged && currentState.currentNode) {
                    const newPos = tr.mapping.map(currentState.currentNode.pos);
                    const view = editor.view;
                    const nodeInfo = getNodeInfoFromPos(view, newPos);
                    if (nodeInfo) {
                        updateState({ currentNode: nodeInfo });
                    } else {
                        hide();
                    }
                }

                // 文档变化时映射命令范围
                if (tr.docChanged && currentState.insertMenuCommandRange) {
                    const mappedFrom = tr.mapping.map(currentState.insertMenuCommandRange.from);
                    const mappedTo = tr.mapping.map(currentState.insertMenuCommandRange.to);
                    if (mappedFrom >= mappedTo) {
                        updateState({ insertMenuCommandRange: null });
                    } else if (
                        mappedFrom !== currentState.insertMenuCommandRange.from ||
                        mappedTo !== currentState.insertMenuCommandRange.to
                    ) {
                        updateState({ insertMenuCommandRange: { from: mappedFrom, to: mappedTo } });
                    }
                }

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

                    // 文档变化时更新当前节点信息
                    if (!view.state.doc.eq(prevState.doc) && currentState.currentNode) {
                        // 优先使用选区位置获取节点（更准确，特别是在插入新节点后）
                        const { from } = view.state.selection;
                        let nodeInfo = getNodeInfoFromPos(view, from);

                        // 如果选区位置获取失败，尝试用映射后的原位置
                        if (!nodeInfo) {
                            const mappedPos = view.state.tr.mapping.map(
                                currentState.currentNode.pos
                            );
                            nodeInfo = getNodeInfoFromPos(view, mappedPos);
                        }

                        // 如果还是失败，尝试用原位置
                        if (!nodeInfo) {
                            nodeInfo = getNodeInfoFromPos(view, currentState.currentNode.pos);
                        }

                        if (nodeInfo) {
                            updateState({ currentNode: nodeInfo });
                        }
                    }
                },

                destroy() {
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                    if (hideTimeoutId) {
                        clearTimeout(hideTimeoutId);
                        hideTimeoutId = null;
                    }
                    // 清理全局监听器
                    document.removeEventListener('dragover', globalDragoverHandler, true);
                    document.removeEventListener('drop', globalDropHandler, true);
                },
            };
        },

        props: {
            handleTextInput(view, from, to, text) {
                if (options.insertMenu?.enabled === false) {
                    return false;
                }
                if (!editor.isEditable) {
                    return false;
                }

                const inputEnabled =
                    options.insertMenu?.triggerOnInput ??
                    options.insertMenu?.triggerOnSlash ??
                    true;
                if (!inputEnabled) {
                    return false;
                }

                // 如果已经由命令打开菜单，继续输入时扩展命令范围（保持输入落入文档）
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
                const isTrigger =
                    typeof trigger === 'string' ? text === trigger : (trigger as RegExp).test(text);

                // 仅在空行输入“触发命令”时触发
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

                // 用光标位置作为触发点
                const coords = view.coordsAtPos(from);
                const triggerRect = new DOMRect(
                    coords.left,
                    coords.top,
                    Math.max(1, coords.right - coords.left),
                    Math.max(1, coords.bottom - coords.top)
                );

                const commandRange = { from, to: from + text.length };

                // 让输入内容落入文档，同时打开菜单
                const tr = view.state.tr.insertText(text, from, to);
                tr.setMeta('openInsertMenu', { triggerRect, commandRange, triggerText: text });
                view.dispatch(tr);

                // 更新 currentNode 供 InsertMenu 使用（不强制显示手柄）
                updateState({
                    currentNode: nodeInfo,
                    isVisible: currentState.isVisible,
                    insertMenuCommandRange: commandRange,
                });

                return true;
            },
            handleDOMEvents: {
                mousemove(view, event) {
                    if (rafId) {
                        return false;
                    }

                    rafId = requestAnimationFrame(() => {
                        rafId = null;
                        handleMouseMove(view, event.clientX, event.clientY);
                    });

                    return false;
                },

                mouseleave(_view, event) {
                    if (currentState.locked || currentState.isDragging) {
                        return false;
                    }

                    // isInSafeZone 已覆盖节点左侧 100px（手柄区域）+ 垂直范围
                    // 如果鼠标还在安全区域内，不隐藏
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

                    // 键盘输入时隐藏手柄
                    if (view.hasFocus()) {
                        hide();
                    }

                    return false;
                },

                dragenter(_view, event) {
                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (!isDragHandle) {
                        return false;
                    }

                    // 在 dragenter 时也调用 preventDefault，确保 drop 可以触发
                    event.preventDefault();
                    if (event.dataTransfer) {
                        event.dataTransfer.dropEffect = 'move';
                    }
                    return true;
                },

                dragover(_view, event) {
                    // 检查是否是我们的拖拽
                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (!isDragHandle) {
                        return false; // 不是我们的拖拽，让其他插件处理
                    }

                    const target = event.target as Element;

                    // 使用缓存来减少 DOM 检查的开销（只在目标元素变化时重新检查）
                    let isNonEditable = false;
                    if (target && target !== lastDragoverTarget) {
                        // 目标元素变化了，重新检查（这里不节流，因为插件层的事件频率可能不同）
                        isNonEditable = isNonEditableNodeInEditor(target, _view);
                        // 更新缓存，供全局处理器使用
                        lastDragoverTarget = target;
                        lastDragoverResult = isNonEditable;
                    } else if (target === lastDragoverTarget && lastDragoverResult !== null) {
                        // 使用缓存结果
                        isNonEditable = lastDragoverResult;
                    }

                    // 关键：必须调用 preventDefault 才能触发 drop 事件
                    event.preventDefault();
                    if (event.dataTransfer) {
                        event.dataTransfer.dropEffect = 'move';
                    }
                    return true; // 消费事件
                },

                dragleave(_view, _event) {
                    // dragleave 事件无需特殊处理
                    return false;
                },

                drop(_view, event) {
                    updateState({ isDragging: false });

                    // 调用 handleDrop 处理拖拽放置
                    return handleDrop(editor, event, null);
                },

                dragend(_view, event) {
                    const isDragHandle = event.dataTransfer?.types.includes(DRAG_HANDLE_MIME);
                    if (isDragHandle) {
                        // 重置缓存
                        lastDragoverTarget = null;
                        lastDragoverResult = null;
                    }
                    return false;
                },
            },
        },
    });
}

/**
 * 锁定拖拽手柄
 */
export function lockDragHandle(editor: Editor, locked: boolean): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', locked));
}

/**
 * 隐藏拖拽手柄
 */
export function hideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('hideDragHandle', true));
}

/**
 * 取消已安排的隐藏（例如鼠标悬停到抓手时）
 */
export function cancelHideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('cancelDragHandleHide', true));
}

/**
 * 重新安排隐藏（例如鼠标离开抓手时）
 */
export function scheduleHideDragHandle(editor: Editor): void {
    editor.view.dispatch(editor.view.state.tr.setMeta('scheduleDragHandleHide', true));
}
