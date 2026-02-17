import { Selection } from '@tiptap/pm/state';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDragHandleContext } from '../contexts/DragHandleContext';
import { isMenuGroup, useInsertMenuContext } from '../contexts/InsertMenuContext';
import type { InsertMenuItem } from '../types';
import { calculateMenuPosition } from '../utils/position';
import { Tooltip } from './Tooltip';

export type InsertMenuProps = Record<string, never>;

/**
 * 插入菜单组件
 *
 * 职责：
 * - 渲染菜单 UI
 * - 处理菜单定位
 * - 处理点击外部关闭
 * - 处理菜单项选择
 *
 * 通过 Context 获取所需状态和方法，保持组件独立性
 */
export const InsertMenu: React.FC<InsertMenuProps> = memo(() => {
    const { editor, pluginState } = useDragHandleContext();
    const { visible, triggerRect, items, positionConfig, closeMenu } = useInsertMenuContext();

    const nodeInfo = pluginState.currentNode;
    const commandRange = pluginState.insertMenuCommandRange ?? null;

    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeIndex, setActiveIndex] = useState(0);

    // 扁平化菜单项（便于索引）
    const flatItems = useMemo(
        () => items.flatMap((item) => (isMenuGroup(item) ? item.items : [item])),
        [items]
    );

    // 计算菜单位置
    useEffect(() => {
        if (!visible || !triggerRect || !menuRef.current) return;

        const menuRect = menuRef.current.getBoundingClientRect();

        // 以 Window 视口为边界计算
        const viewportRect = {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
        } as DOMRect;

        const pos = calculateMenuPosition(triggerRect, menuRect, viewportRect, {
            placement: positionConfig?.placement,
            offset: positionConfig?.offset,
        });

        setPosition({ x: pos.x, y: pos.y });
    }, [visible, triggerRect, positionConfig?.placement, positionConfig?.offset]);

    // 点击外部关闭
    useEffect(() => {
        if (!visible) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        // 延迟添加事件监听，避免立即触发
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, closeMenu]);

    // 重置 activeIndex（用 queueMicrotask 避免在 effect 内同步 setState 导致级联渲染）
    useEffect(() => {
        if (visible) {
            queueMicrotask(() => setActiveIndex(0));
        }
    }, [visible]);

    // 处理菜单项选择
    const handleSelect = useCallback(
        (item: InsertMenuItem) => {
            const { view } = editor;

            // 如果是通过输入命令打开，先删除命令文本
            if (commandRange && commandRange.to > commandRange.from) {
                const tr = view.state.tr.delete(commandRange.from, commandRange.to);
                const safePos = Math.min(Math.max(commandRange.from, 0), tr.doc.content.size);
                tr.setSelection(Selection.near(tr.doc.resolve(safePos)));
                view.dispatch(tr);
            } else {
                if (!nodeInfo) return;

                // 聚焦到节点位置
                const { pos } = nodeInfo;
                const tr = view.state.tr.setSelection(
                    Selection.near(view.state.doc.resolve(pos + 1))
                );
                view.dispatch(tr);
            }

            // 执行命令
            item.command(editor);

            closeMenu();
        },
        [commandRange, editor, nodeInfo, closeMenu]
    );

    // 渲染单个菜单项
    const renderItem = useCallback(
        (item: InsertMenuItem, index: number) => (
            <button
                className={classNames('tiptap-insert-menu__item', {
                    'tiptap-insert-menu__item--active': index === activeIndex,
                })}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(index)}
            >
                {item.icon && <span className="tiptap-insert-menu__item-icon">{item.icon}</span>}
                <span className="tiptap-insert-menu__item-label">{item.label}</span>
                {item.shortcut && (
                    <span className="tiptap-insert-menu__item-shortcut">{item.shortcut}</span>
                )}
            </button>
        ),
        [activeIndex, handleSelect]
    );

    // 不可见时不渲染
    if (!visible) {
        return null;
    }

    return createPortal(
        <div
            ref={menuRef}
            className="tiptap-insert-menu"
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 1000,
            }}
        >
            <div className="tiptap-insert-menu__list">
                {items.length > 0 ? (
                    items.map((itemOrGroup) => {
                        if (isMenuGroup(itemOrGroup)) {
                            return (
                                <div
                                    key={itemOrGroup.id}
                                    className={classNames('tiptap-insert-menu__group', {
                                        'tiptap-insert-menu__group--basic':
                                            itemOrGroup.id === 'basic',
                                    })}
                                >
                                    {itemOrGroup.title && (
                                        <div className="tiptap-insert-menu__group-title">
                                            {itemOrGroup.title}
                                        </div>
                                    )}
                                    <div className="tiptap-insert-menu__group-list">
                                        {itemOrGroup.items.map((item) => {
                                            const flatIndex = flatItems.findIndex(
                                                (i) => i.id === item.id
                                            );
                                            const button = renderItem(item, flatIndex);

                                            if (itemOrGroup.id === 'basic') {
                                                return (
                                                    <Tooltip key={item.id} content={item.label}>
                                                        {button}
                                                    </Tooltip>
                                                );
                                            }

                                            return (
                                                <React.Fragment key={item.id}>
                                                    {button}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <React.Fragment key={itemOrGroup.id}>
                                {renderItem(
                                    itemOrGroup,
                                    flatItems.findIndex((i) => i.id === itemOrGroup.id)
                                )}
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div className="tiptap-insert-menu__empty">无匹配结果</div>
                )}
            </div>
        </div>,
        document.body
    );
});

InsertMenu.displayName = 'InsertMenu';

export default InsertMenu;
