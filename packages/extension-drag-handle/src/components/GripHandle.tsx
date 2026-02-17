import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
        position,
        handleStyle,
        isHovering,
        handleMouseEnter,
        handleMouseLeave,
    } = useHandleBase();

    const [isDragging, setIsDragging] = useState(false);

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
            if (!nodeInfo) {
                e.preventDefault();
                return;
            }

            setIsDragging(true);
            dispatchDraggingState(true);
            startDragNode(editor, nodeInfo, e.nativeEvent);
            options.onDragStart?.(nodeInfo, e.nativeEvent);
        },
        [editor, nodeInfo, options, dispatchDraggingState]
    );

    // 处理拖拽结束
    const handleDragEnd = useCallback(
        (e: React.DragEvent) => {
            setIsDragging(false);
            dispatchDraggingState(false);
            options.onDragEnd?.(nodeInfo, e.nativeEvent);
        },
        [nodeInfo, options, dispatchDraggingState]
    );

    // 监听全局 drop 事件以处理跨区域拖拽
    useEffect(() => {
        const handleGlobalDrop = () => {
            setIsDragging(false);
            dispatchDraggingState(false);
        };

        document.addEventListener('drop', handleGlobalDrop);
        return () => document.removeEventListener('drop', handleGlobalDrop);
    }, [dispatchDraggingState]);

    // 渲染图标
    const icon = useMemo(() => {
        const customIcon = options.element?.drag;
        if (customIcon) {
            return customIcon as React.ReactNode;
        }
        return <GripIcon className="tiptap-drag-handle_icon" size={handleStyle.iconSize} />;
    }, [handleStyle.iconSize, options.element?.drag]);

    if (!position) {
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
                width: handleStyle.width,
                height: handleStyle.height,
                zIndex: handleStyle.zIndex,
                pointerEvents: 'auto',
                opacity: 1,
            }}
            draggable={!locked}
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
