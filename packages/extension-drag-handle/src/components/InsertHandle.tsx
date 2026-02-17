import classNames from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useInsertMenuContext } from '../contexts/InsertMenuContext';
import { useHandleBase } from '../hooks/useHandleBase';
import { PlusIcon } from './Icons';

export type InsertHandleProps = Record<string, never>;

/**
 * 插入手柄组件（插入模式）
 *
 * 职责：
 * - 显示加号图标
 * - 处理点击事件（打开插入菜单）
 */
export const InsertHandle: React.FC<InsertHandleProps> = memo(() => {
    const {
        options,
        nodeInfo,
        locked,
        position,
        handleStyle,
        isHovering,
        handleMouseEnter,
        handleMouseLeave,
    } = useHandleBase();

    const { openMenu, enabled: insertMenuEnabled } = useInsertMenuContext();

    // 处理点击（触发插入菜单）
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!nodeInfo || !insertMenuEnabled) return;

            // 以当前元素为触发区域
            const rect = e.currentTarget.getBoundingClientRect();
            openMenu(rect);

            // 对外暴露的插入点击回调
            options.onInsertClick?.(nodeInfo, e.nativeEvent);
        },
        [nodeInfo, insertMenuEnabled, openMenu, options]
    );

    // 渲染图标
    const icon = useMemo(() => {
        const customIcon = options.element?.insert;
        if (customIcon) {
            return customIcon as React.ReactNode;
        }
        return <PlusIcon className="tiptap-drag-handle_icon" size={handleStyle.iconSize} />;
    }, [handleStyle.iconSize, options.element?.insert]);

    if (!position) {
        return null;
    }

    return (
        <div
            className={classNames('tiptap-drag-handle', 'tiptap-drag-handle--insert', {
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
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-drag-handle
            data-mode="insert"
        >
            {icon}
        </div>
    );
});

InsertHandle.displayName = 'InsertHandle';

export default InsertHandle;
