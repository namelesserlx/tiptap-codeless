import type { Transaction } from '@tiptap/pm/state';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CodeIcon, DividerIcon, ListIcon, ParagraphIcon, QuoteIcon } from '../components/Icons';
import { lockDragHandle } from '../extension/DragHandlePlugin';
import { resolveDragHandleMessages } from '../i18n';
import type { InsertMenuGroup, InsertMenuItem } from '../types';
import { useDragHandleContext } from './DragHandleContext';

/** 菜单位置配置类型 */
export interface InsertMenuPositionConfig {
    placement?: 'right' | 'left' | 'bottom' | 'top';
    offset?: { x?: number; y?: number };
}

// ============ 默认菜单项 ============

/**
 * 默认菜单项
 */
export function createDefaultInsertMenuItems(locale?: string | null, overrides?: Parameters<typeof resolveDragHandleMessages>[1]): (InsertMenuItem | InsertMenuGroup)[] {
    const messages = resolveDragHandleMessages(locale, overrides);

    return [
        {
            id: 'basic',
            title: messages.insertMenu.groups.basic,
            items: [
                {
                    id: 'heading1',
                    label: messages.insertMenu.items.heading1,
                    icon: <div style={{ fontSize: '16px', fontWeight: 600 }}>H1</div>,
                    shortcut: '# ',
                    command: (editor) => {
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                    },
                },
                {
                    id: 'heading2',
                    label: messages.insertMenu.items.heading2,
                    icon: <div style={{ fontSize: '15px', fontWeight: 600 }}>H2</div>,
                    shortcut: '## ',
                    command: (editor) => {
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                    },
                },
                {
                    id: 'heading3',
                    label: messages.insertMenu.items.heading3,
                    icon: <div style={{ fontSize: '14px', fontWeight: 600 }}>H3</div>,
                    shortcut: '### ',
                    command: (editor) => {
                        editor.chain().focus().toggleHeading({ level: 3 }).run();
                    },
                },
                {
                    id: 'bulletList',
                    label: messages.insertMenu.items.bulletList,
                    icon: <ListIcon size={18} />,
                    shortcut: '- ',
                    command: (editor) => {
                        editor.chain().focus().toggleBulletList().run();
                    },
                },
                {
                    id: 'orderedList',
                    label: messages.insertMenu.items.orderedList,
                    icon: <ListIcon size={18} />,
                    shortcut: '1. ',
                    command: (editor) => {
                        editor.chain().focus().toggleOrderedList().run();
                    },
                },
            ],
        },
        {
            id: 'common',
            title: messages.insertMenu.groups.common,
            items: [
                {
                    id: 'paragraph',
                    label: messages.insertMenu.items.paragraph,
                    icon: <ParagraphIcon size={18} />,
                    command: (editor) => {
                        editor.chain().focus().setParagraph().run();
                    },
                },
                {
                    id: 'blockquote',
                    label: messages.insertMenu.items.blockquote,
                    icon: <QuoteIcon size={18} />,
                    shortcut: '> ',
                    command: (editor) => {
                        editor.chain().focus().toggleBlockquote().run();
                    },
                },
                {
                    id: 'codeBlock',
                    label: messages.insertMenu.items.codeBlock,
                    icon: <CodeIcon size={18} />,
                    shortcut: '```',
                    command: (editor) => {
                        editor.chain().focus().toggleCodeBlock().run();
                    },
                },
                {
                    id: 'horizontalRule',
                    label: messages.insertMenu.items.horizontalRule,
                    icon: <DividerIcon size={18} />,
                    shortcut: '---',
                    command: (editor) => {
                        editor.chain().focus().setHorizontalRule().run();
                    },
                },
            ],
        },
    ];
}

export const defaultInsertMenuItems: (InsertMenuItem | InsertMenuGroup)[] = createDefaultInsertMenuItems();

// ============ 工具函数 ============

/**
 * 判断是否为分组
 */
export function isMenuGroup(item: InsertMenuItem | InsertMenuGroup): item is InsertMenuGroup {
    return 'items' in item;
}

/**
 * 合并插入菜单项
 */
export function mergeInsertMenuItems(
    defaultItems: (InsertMenuItem | InsertMenuGroup)[],
    userItems: (InsertMenuItem | InsertMenuGroup)[]
): (InsertMenuItem | InsertMenuGroup)[] {
    const result = defaultItems.map((item) =>
        isMenuGroup(item) ? { ...item, items: [...item.items] } : { ...item }
    );

    const idIndexMap = new Map(result.map((item, index) => [item.id, index]));

    for (const userItem of userItems) {
        const existingIndex = idIndexMap.get(userItem.id);

        if (existingIndex !== undefined) {
            const existingItem = result[existingIndex];

            if (isMenuGroup(userItem) && isMenuGroup(existingItem)) {
                const existingItemIds = new Set(existingItem.items.map((i) => i.id));
                for (const item of userItem.items) {
                    const idx = existingItem.items.findIndex((i) => i.id === item.id);
                    if (idx !== -1) {
                        existingItem.items[idx] = item;
                    } else if (!existingItemIds.has(item.id)) {
                        existingItem.items.push(item);
                    }
                }
                if (userItem.title !== undefined) {
                    existingItem.title = userItem.title;
                }
            } else {
                result[existingIndex] = userItem;
            }
        } else {
            result.push(userItem);
            idIndexMap.set(userItem.id, result.length - 1);
        }
    }

    return result;
}

// ============ Context ============

/**
 * InsertMenu 上下文值
 */
export interface InsertMenuContextValue {
    /** 菜单是否可见 */
    visible: boolean;
    /** 触发区域位置 */
    triggerRect: DOMRect | null;
    /** 菜单项 */
    items: (InsertMenuItem | InsertMenuGroup)[];
    /** 菜单位置配置 */
    positionConfig: InsertMenuPositionConfig | undefined;
    /** 菜单层级 */
    zIndex: number;
    /** 空状态文案 */
    emptyLabel: string;
    /** 是否启用 */
    enabled: boolean;
    /** 打开菜单 */
    openMenu: (rect: DOMRect | null) => void;
    /** 关闭菜单 */
    closeMenu: () => void;
}

const InsertMenuContext = createContext<InsertMenuContextValue | null>(null);

export interface InsertMenuProviderProps {
    children: React.ReactNode;
}

/**
 * InsertMenu 上下文提供者
 * 管理菜单的可见性、位置和菜单项
 */
export const InsertMenuProvider: React.FC<InsertMenuProviderProps> = ({ children }) => {
    const { editor, options } = useDragHandleContext();
    const [visible, setVisible] = useState(false);
    const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
    const messages = useMemo(
        () => resolveDragHandleMessages(options.locale, options.messages),
        [options.locale, options.messages]
    );

    // 是否启用插入菜单
    const enabled = options.insertMenu?.enabled !== false;

    // 计算菜单项
    const items = useMemo(() => {
        const userItems = options.insertMenu?.items;
        const itemsMode = options.insertMenu?.itemsMode ?? 'replace';
        const builtInItems = createDefaultInsertMenuItems(options.locale, options.messages);

        if (!userItems?.length) {
            return builtInItems;
        }

        return itemsMode === 'merge'
            ? mergeInsertMenuItems(builtInItems, userItems)
            : userItems;
    }, [options.insertMenu?.items, options.insertMenu?.itemsMode, options.locale, options.messages]);

    // 菜单位置配置
    const positionConfig = options.insertMenu?.position;
    const zIndex = options.ui?.menu?.zIndex ?? 1000;
    const emptyLabel = messages.insertMenu.empty;

    // 打开菜单
    const openMenu = useCallback(
        (rect: DOMRect | null) => {
            if (!enabled) return;
            setTriggerRect(rect);
            setVisible(true);
            lockDragHandle(editor, true);
        },
        [editor, enabled]
    );

    // 关闭菜单
    const closeMenu = useCallback(() => {
        setVisible(false);
        setTriggerRect(null);
        editor.view.dispatch(editor.view.state.tr.setMeta('clearInsertMenuCommandRange', true));
        lockDragHandle(editor, false);
    }, [editor]);

    // 监听事务以支持 "/" 打开插入菜单
    useEffect(() => {
        const handleTransaction = ({ transaction }: { transaction: Transaction }) => {
            const rect = transaction?.getMeta?.('openInsertMenu')?.triggerRect as
                | DOMRect
                | undefined;
            if (rect) {
                openMenu(rect);
            }
        };

        editor.on('transaction', handleTransaction);
        return () => {
            editor.off('transaction', handleTransaction);
        };
    }, [editor, openMenu]);

    // 编辑器销毁时清理
    useEffect(() => {
        return () => {
            setVisible(false);
        };
    }, []);

    const value = useMemo(
        () => ({
            visible,
            triggerRect,
            items,
            positionConfig,
            zIndex,
            emptyLabel,
            enabled,
            openMenu,
            closeMenu,
        }),
        [visible, triggerRect, items, positionConfig, zIndex, emptyLabel, enabled, openMenu, closeMenu]
    );

    return <InsertMenuContext.Provider value={value}>{children}</InsertMenuContext.Provider>;
};

/**
 * 获取 InsertMenu 上下文
 */
export const useInsertMenuContext = (): InsertMenuContextValue => {
    const context = useContext(InsertMenuContext);

    if (!context) {
        throw new Error('useInsertMenuContext must be used within an InsertMenuProvider');
    }

    return context;
};
