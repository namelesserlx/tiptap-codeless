/**
 * Drag Handle 类型定义
 */

import type { DeepPartial, SupportedLocale } from '@tiptap-codeless/core';
import type { Editor } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import React from 'react';
import type { DragHandleMessages } from '../i18n';

export type DragHandleMode = 'drag' | 'insert';

export type MenuPlacement = 'right' | 'left' | 'bottom' | 'top';

export interface InsertMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    group?: string;
    command: (editor: Editor) => void;
}

export interface InsertMenuGroup {
    id: string;
    title?: string;
    items: InsertMenuItem[];
}

export interface CurrentNodeInfo {
    node: Node;
    pos: number;
    dom: HTMLElement;
    isEmpty: boolean;
    rect: DOMRect;
}

export interface DragHandleEvents {
    onDragStart?: (info: CurrentNodeInfo, event: DragEvent) => void;
    onDragEnd?: (info: CurrentNodeInfo | null, event: DragEvent) => void;
    onNodeChange?: (info: CurrentNodeInfo | null) => void;
    onInsertClick?: (info: CurrentNodeInfo, event: MouseEvent) => void;
}

export interface DragHandleOptions {
    locale?: SupportedLocale | string;
    messages?: DeepPartial<DragHandleMessages>;
    offset?: {
        x?: number;
        y?: number;
    };
    handle?: {
        width?: number;
        height?: number;
        iconSize?: number;
        hoverDelay?: number;
        hideDelay?: number;
        zIndex?: number;
        icons?: {
            insert?: React.ReactNode;
            drag?: React.ReactNode;
        };
    };
    drag?: {
        enabled?: boolean;
        opacity?: number;
    };
    insertMenu?: {
        enabled?: boolean;
        trigger?: string | RegExp | false;
        strategy?: 'replace' | 'merge';
        placement?: MenuPlacement;
        offset?: {
            x?: number;
            y?: number;
        };
        zIndex?: number;
        items?: (InsertMenuItem | InsertMenuGroup)[];
        component?: React.ComponentType<InsertMenuProps>;
    };
    nodes?: {
        include?: string[];
        exclude?: string[];
    };
    events?: DragHandleEvents;
}

export interface DragHandlePluginState {
    locked: boolean;
    currentNode: CurrentNodeInfo | null;
    isDragging: boolean;
    isVisible: boolean;
    insertMenuCommandRange?: { from: number; to: number } | null;
}

export interface DragHandleComponentProps {
    editor: Editor;
    nodeInfo: CurrentNodeInfo | null;
    mode: DragHandleMode;
    visible: boolean;
    locked: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onInsertClick: (e: React.MouseEvent) => void;
    options: DragHandleOptions;
}

export interface InsertMenuProps {
    items: (InsertMenuItem | InsertMenuGroup)[];
    visible: boolean;
    triggerRect: DOMRect | null;
    placement?: MenuPlacement;
    offset?: { x?: number; y?: number };
    zIndex?: number;
    onClose: () => void;
}
