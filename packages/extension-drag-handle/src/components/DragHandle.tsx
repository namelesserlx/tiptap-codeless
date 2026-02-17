import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { useDragHandleContext } from '../contexts/DragHandleContext';
import { GripHandle } from './GripHandle';
import { InsertHandle } from './InsertHandle';

/** 容器样式常量 */
const CONTAINER_STYLE: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
};

export type DragHandleProps = Record<string, never>;

/**
 * 拖拽手柄入口组件
 *
 * 职责：
 * - 根据节点状态（空/非空）切换显示 GripHandle 或 InsertHandle
 * - 管理 Portal 渲染
 *
 * 遵循高内聚原则，具体的事件处理下沉到子组件
 */
export const DragHandle: React.FC<DragHandleProps> = memo(() => {
    const { editor, pluginState } = useDragHandleContext();
    const { currentNode: nodeInfo, isVisible: visible } = pluginState;

    // 不满足显示条件时不渲染
    if (!visible || !nodeInfo || !editor.isEditable) {
        return null;
    }

    // 根据节点是否为空决定模式
    const isInsertMode = nodeInfo.isEmpty;

    return createPortal(
        <div className="tiptap-drag-handle-container" style={CONTAINER_STYLE}>
            {isInsertMode ? <InsertHandle /> : <GripHandle />}
        </div>,
        document.body
    );
});

DragHandle.displayName = 'DragHandle';

export default DragHandle;
