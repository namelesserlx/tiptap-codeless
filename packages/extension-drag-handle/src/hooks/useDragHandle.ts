/**
 * useDragHandle Hook
 * 管理拖拽手柄状态
 */

import type { Editor } from '@tiptap/core';
import { useCallback, useEffect, useState } from 'react';
import { dragHandlePluginKey } from '../extension/DragHandlePlugin';
import type { CurrentNodeInfo, DragHandlePluginState } from '../types';

export interface UseDragHandleReturn {
    /** 当前节点信息 */
    nodeInfo: CurrentNodeInfo | null;
    /** 是否可见 */
    visible: boolean;
    /** 是否锁定 */
    locked: boolean;
    /** 是否正在拖拽 */
    isDragging: boolean;
    /** 当前模式 */
    mode: 'drag' | 'insert';
    /** 锁定手柄 */
    lock: () => void;
    /** 解锁手柄 */
    unlock: () => void;
    /** 隐藏手柄 */
    hide: () => void;
}

/**
 * 拖拽手柄状态管理 Hook
 */
export function useDragHandle(editor: Editor | null): UseDragHandleReturn {
    const [state, setState] = useState<DragHandlePluginState>({
        locked: false,
        currentNode: null,
        isDragging: false,
        isVisible: false,
    });

    // 监听插件状态变化
    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            const pluginState = dragHandlePluginKey.getState(editor.state);
            if (pluginState) {
                setState(pluginState);
            }
        };

        // 初始化状态
        updateState();

        // 监听事务
        const handleTransaction = () => {
            updateState();
        };

        editor.on('transaction', handleTransaction);

        return () => {
            editor.off('transaction', handleTransaction);
        };
    }, [editor]);

    // 锁定手柄
    const lock = useCallback(() => {
        if (!editor) return;
        editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', true));
    }, [editor]);

    // 解锁手柄
    const unlock = useCallback(() => {
        if (!editor) return;
        editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', false));
    }, [editor]);

    // 隐藏手柄
    const hide = useCallback(() => {
        if (!editor) return;
        editor.view.dispatch(editor.view.state.tr.setMeta('hideDragHandle', true));
    }, [editor]);

    // 计算模式
    const mode = state.currentNode?.isEmpty ? 'insert' : 'drag';

    return {
        nodeInfo: state.currentNode,
        visible: state.isVisible,
        locked: state.locked,
        isDragging: state.isDragging,
        mode,
        lock,
        unlock,
        hide,
    };
}

export default useDragHandle;
