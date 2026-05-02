import classNames from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useHandleBase } from '../hooks/useHandleBase';
import { startDragNode } from '../utils/drag';
import { GripIcon } from './Icons';

export type GripHandleProps = Record<string, never>;

/**
 * 抓手组件（拖拽模式）
 *
 * 职责：
 * - 显示抓手图标
 * - 处理拖拽开始/结束事件
 * - 监听全局 drop 事件
 */
export const GripHandle: React.FC<GripHandleProps> = memo(() => {
    const {
        editor,
        options,
        nodeInfo,
        locked,
        isDragging,
        position,
        handle,
        isHovering,
        shouldShow,
        handleMouseEnter,
        handleMouseLeave,
    } = useHandleBase();

    const isDisabled = locked || !editor.isEditable;

    // 通知插件更新拖拽状态
    const dispatchDraggingState = useCallback(
        (dragging: boolean) => {
            const tr = editor.view.state.tr.setMeta('dragHandleDragging', dragging);
            editor.view.dispatch(tr);
        },
        [editor]
    );

    // 处理拖拽开始
    const handleDragStart = useCallback(
        (e: React.DragEvent) => {
            if (!nodeInfo || !editor.isEditable) {
                e.preventDefault();
                return;
            }

            dispatchDraggingState(true);
            startDragNode(editor, nodeInfo, e.nativeEvent, options.drag?.opacity);
            options.events?.onDragStart?.(nodeInfo, e.nativeEvent);
        },
        [editor, nodeInfo, options, dispatchDraggingState]
    );

    // 处理拖拽结束
    const handleDragEnd = useCallback(
        (e: React.DragEvent) => {
            dispatchDraggingState(false);
            options.events?.onDragEnd?.(nodeInfo, e.nativeEvent);
        },
        [nodeInfo, options, dispatchDraggingState]
    );

    // 渲染图标
    const icon = useMemo(() => {
        const customIcon = options.handle?.icons?.drag;
        if (customIcon) {
            return customIcon;
        }
        return <GripIcon className="tiptap-drag-handle_icon" size={handle.iconSize} />;
    }, [handle.iconSize, options.handle?.icons?.drag]);

    if (!position || !shouldShow) {
        return null;
    }

    return (
        <div
            className={classNames('tiptap-drag-handle', 'tiptap-drag-handle--drag', {
                'tiptap-drag-handle--dragging': isDragging,
                'tiptap-drag-handle--hovering': isHovering,
                'tiptap-drag-handle--locked': locked,
            })}
            style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                width: handle.width,
                height: handle.height,
                zIndex: handle.zIndex,
                pointerEvents: 'auto',
                opacity: 1,
            }}
            draggable={!isDisabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-drag-handle
            data-mode="drag"
        >
            {icon}
        </div>
    );
});

GripHandle.displayName = 'GripHandle';

export default GripHandle;
