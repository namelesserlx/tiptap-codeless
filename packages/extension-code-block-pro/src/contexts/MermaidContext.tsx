/**
 * Mermaid Context - 包含 Mermaid 相关状态
 */

import React, { createContext, useContext } from 'react';

export interface MermaidContextValue {
    /**
     * 是否为 Mermaid 代码块
     */
    isMermaid: boolean;

    /**
     * 是否显示 Mermaid 图表模式
     */
    isShowingMermaidDiagram: boolean;
}

const MermaidContext = createContext<MermaidContextValue | null>(null);

export interface MermaidContextProviderProps {
    value: MermaidContextValue;
    children: React.ReactNode;
}

export const MermaidContextProvider: React.FC<MermaidContextProviderProps> = ({
    value,
    children,
}) => {
    return <MermaidContext.Provider value={value}>{children}</MermaidContext.Provider>;
};

export function useMermaidContext(): MermaidContextValue {
    const context = useContext(MermaidContext);

    if (!context) {
        throw new Error('useMermaidContext must be used within MermaidContextProvider');
    }

    return context;
}
