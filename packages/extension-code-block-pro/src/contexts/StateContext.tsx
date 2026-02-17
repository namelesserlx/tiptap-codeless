/**
 * 状态 Context - 包含用户操作时会变化的状态
 */

import React, { createContext, useContext } from 'react';

export interface StateContextValue {
    /**
     * 是否折叠
     */
    isCollapsed: boolean;

    /**
     * 折叠时显示的行数
     */
    collapsedLines: number;

    /**
     * 是否可折叠
     */
    isCollapsible: boolean;

    /**
     * 切换折叠状态
     */
    toggleCollapse: () => void;

    /**
     * 是否显示行号
     */
    showLineNumbers: boolean;

    /**
     * 切换行号显示
     */
    toggleLineNumbers: () => void;

    /**
     * 是否全屏
     */
    isFullscreen: boolean;

    /**
     * 处理全屏
     */
    handleFullscreen: () => void;
}

const StateContext = createContext<StateContextValue | null>(null);

export interface StateContextProviderProps {
    value: StateContextValue;
    children: React.ReactNode;
}

export const StateContextProvider: React.FC<StateContextProviderProps> = ({ value, children }) => {
    return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export function useStateContext(): StateContextValue {
    const context = useContext(StateContext);

    if (!context) {
        throw new Error('useStateContext must be used within StateContextProvider');
    }

    return context;
}
