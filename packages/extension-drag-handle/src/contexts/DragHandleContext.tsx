import type { Editor } from '@tiptap/core';
import React, { createContext, useContext, useMemo } from 'react';
import type { DragHandleOptions, DragHandlePluginState } from '../types';

/**
 * DragHandle 核心上下文值
 * 仅包含编辑器相关的基础数据
 */
export interface DragHandleContextValue {
    /** 编辑器实例 */
    editor: Editor;
    /** 扩展配置选项 */
    options: DragHandleOptions;
    /** 插件状态 */
    pluginState: DragHandlePluginState;
    /** UI Portal 宿主 */
    hostElement: HTMLElement | null;
}

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

export interface DragHandleProviderProps {
    children: React.ReactNode;
    editor: Editor;
    options: DragHandleOptions;
    pluginState: DragHandlePluginState;
    hostElement: HTMLElement | null;
}

/**
 * DragHandle 上下文提供者
 * 提供编辑器、配置和插件状态
 */
export const DragHandleProvider: React.FC<DragHandleProviderProps> = ({
    children,
    editor,
    options,
    pluginState,
    hostElement,
}) => {
    const value = useMemo(
        () => ({ editor, options, pluginState, hostElement }),
        [editor, options, pluginState, hostElement]
    );

    return <DragHandleContext.Provider value={value}>{children}</DragHandleContext.Provider>;
};

/**
 * 获取 DragHandle 核心上下文
 */
export const useDragHandleContext = (): DragHandleContextValue => {
    const context = useContext(DragHandleContext);

    if (!context) {
        throw new Error('useDragHandleContext must be used within a DragHandleProvider');
    }

    return context;
};
