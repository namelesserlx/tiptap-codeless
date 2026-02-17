/**
 * Drag Handle 类型定义
 */

import type { Editor } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import React from 'react';

/**
 * 拖拽手柄模式
 */
export type DragHandleMode = 'drag' | 'insert';

/**
 * 插入菜单项
 */
export interface InsertMenuItem {
    /** 唯一标识 */
    id: string;
    /** 显示标签 */
    label: string;
    /** 图标（React 节点或 SVG 字符串） */
    icon?: React.ReactNode;
    /** 快捷键提示 */
    shortcut?: string;
    /** 分组 */
    group?: string;
    /** 执行的命令 */
    command: (editor: Editor) => void;
}

/**
 * 插入菜单分组
 */
export interface InsertMenuGroup {
    /** 分组 ID */
    id: string;
    /** 分组标题 */
    title?: string;
    /** 菜单项 */
    items: InsertMenuItem[];
}

/**
 * 当前节点信息
 */
export interface CurrentNodeInfo {
    /** ProseMirror 节点 */
    node: Node;
    /** 节点在文档中的位置 */
    pos: number;
    /** 对应的 DOM 元素 */
    dom: HTMLElement;
    /** 是否为空节点 */
    isEmpty: boolean;
    /** 节点的边界信息 */
    rect: DOMRect;
}

/**
 * 拖拽手柄扩展选项
 */
export interface DragHandleOptions {
    /** 拖拽手柄元素（可自定义） */
    element?: {
        insert?: React.ReactNode | HTMLElement;
        drag?: React.ReactNode | HTMLElement;
    };

    /** 手柄显示的偏移量 */
    offset?: {
        x?: number;
        y?: number;
    };

    /** 拖拽开始回调 */
    onDragStart?: (info: CurrentNodeInfo, event: DragEvent) => void;

    /** 拖拽结束回调 */
    onDragEnd?: (info: CurrentNodeInfo | null, event: DragEvent) => void;

    /** 节点变化回调 */
    onNodeChange?: (info: CurrentNodeInfo | null) => void;

    /** 点击插入按钮回调 */
    onInsertClick?: (info: CurrentNodeInfo, event: MouseEvent) => void;

    /** 插入菜单配置 */
    insertMenu?: {
        /** 是否启用 */
        enabled?: boolean;
        /**
         * 输入触发打开（默认 true）
         * - 仅在"当前行为空"时生效
         */
        triggerOnInput?: boolean;
        /**
         * 触发命令（默认 "/"）
         * - 支持 string（精确匹配）或 RegExp（test）
         */
        trigger?: string | RegExp;
        /** @deprecated 使用 triggerOnInput + trigger 替代 */
        triggerOnSlash?: boolean;
        /** 菜单项或分组 */
        items?: (InsertMenuItem | InsertMenuGroup)[];
        /**
         * 菜单项模式
         * - 'replace': 用户的 items 完全替换默认菜单项（默认）
         * - 'merge': 用户的 items 与默认菜单项合并（相同 id 的 group 会合并其 items）
         */
        itemsMode?: 'replace' | 'merge';
        /** 自定义菜单组件 */
        custom?: React.ComponentType<InsertMenuProps>;

        /** 菜单位置配置 */
        position?: {
            /** 优先展示方向（默认 right） */
            placement?: 'right' | 'left' | 'bottom' | 'top';
            /** 额外偏移（px） */
            offset?: {
                x?: number;
                y?: number;
            };
        };
    };

    /** 拖拽功能配置 */
    drag?: {
        /** 是否启用 */
        enabled?: boolean;
        /** 拖拽时的不透明度 */
        dragOpacity?: number;
    };

    /** 手柄样式配置 */
    handleStyle?: {
        /** 手柄宽度 */
        width?: number;
        /** 手柄高度 */
        height?: number;
        /** 悬浮延迟 (ms) */
        hoverDelay?: number;
        /** 隐藏延迟 (ms) */
        hideDelay?: number;
        /** z-index */
        zIndex?: number;
        /** iconSize */
        iconSize?: number;
    };

    /** 排除的节点类型（这些节点不显示拖拽手柄） */
    excludeNodes?: string[];

    /** 只在这些节点类型上显示 */
    includeOnlyNodes?: string[];
}

/**
 * 插件状态
 */
export interface DragHandlePluginState {
    /** 是否锁定（如菜单打开时） */
    locked: boolean;
    /** 当前节点信息 */
    currentNode: CurrentNodeInfo | null;
    /** 是否正在拖拽 */
    isDragging: boolean;
    /** 是否显示手柄 */
    isVisible: boolean;

    /** 由输入命令打开菜单时的命令范围（用于后续删除） */
    insertMenuCommandRange?: { from: number; to: number } | null;
}

/**
 * 拖拽手柄 React 组件 Props
 */
export interface DragHandleComponentProps {
    /** 编辑器实例 */
    editor: Editor;
    /** 当前节点信息 */
    nodeInfo: CurrentNodeInfo | null;
    /** 当前模式 */
    mode: DragHandleMode;
    /** 是否可见 */
    visible: boolean;
    /** 是否锁定 */
    locked: boolean;
    /** 拖拽开始 */
    onDragStart: (e: React.DragEvent) => void;
    /** 拖拽结束 */
    onDragEnd: (e: React.DragEvent) => void;
    /** 点击插入 */
    onInsertClick: (e: React.MouseEvent) => void;
    /** 扩展选项 */
    options: DragHandleOptions;
}

/**
 * 插入菜单组件 Props
 */
export interface InsertMenuProps {
    /** 菜单项 */
    items: (InsertMenuItem | InsertMenuGroup)[];
    /** 是否可见 */
    visible: boolean;
    /** 触发按钮/光标的位置 */
    triggerRect: DOMRect | null;

    /** 菜单位置配置 */
    position?: {
        placement?: 'right' | 'left' | 'bottom' | 'top';
        offset?: { x?: number; y?: number };
    };

    /** 关闭回调 */
    onClose: () => void;
}
