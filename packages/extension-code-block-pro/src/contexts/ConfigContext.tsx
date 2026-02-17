/**
 * 配置 Context - 包含极少变化的配置数据
 */

import React, { createContext, useContext } from 'react';
import type {
    CodeBlockAttributes,
    CodeBlockProOptions,
    CodeBlockTheme,
    LanguageConfig,
} from '@/types';

export interface ConfigContextValue {
    /**
     * 节点属性
     */
    nodeAttrs: CodeBlockAttributes;

    /**
     * 扩展选项
     */
    options: CodeBlockProOptions;

    /**
     * 支持的语言列表
     */
    languages: LanguageConfig[];

    /**
     * 当前主题
     */
    theme: CodeBlockTheme;

    /**
     * 更新节点属性
     */
    updateAttributes: (attrs: Partial<CodeBlockAttributes>) => void;

    /**
     * 删除节点
     */
    deleteNode?: () => void;

    /**
     * 获取节点位置
     */
    getPos: () => number;

    /**
     * 内容 ref
     */
    contentRef: React.RefObject<HTMLDivElement | null>;

    /**
     * 包装器 ref
     */
    wrapperRef: React.RefObject<HTMLDivElement | null>;

    /**
     * 内容区 ref（code-block-body）
     */
    bodyRef: React.RefObject<HTMLDivElement | null>;

    /**
     * 切换为图表前写入的代码区高度
     */
    diagramFromHeightRef: React.MutableRefObject<number>;

    /**
     * 获取内容区当前高度
     */
    getBodyHeight: () => number;

    /**
     * 获取代码内容（纯文本）
     */
    getCodeContent: () => string;

    /**
     * 当前语言配置
     */
    currentLanguage: LanguageConfig;

    /**
     * 更改语言
     */
    changeLanguage: (language: string) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export interface ConfigContextProviderProps {
    value: ConfigContextValue;
    children: React.ReactNode;
}

export const ConfigContextProvider: React.FC<ConfigContextProviderProps> = ({
    value,
    children,
}) => {
    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export function useConfigContext(): ConfigContextValue {
    const context = useContext(ConfigContext);

    if (!context) {
        throw new Error('useConfigContext must be used within ConfigContextProvider');
    }

    return context;
}
