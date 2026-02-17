/**
 * 行号状态管理 Hook
 */

import { useCallback, useState } from 'react';
import type { LineNumbersConfig } from '@/types';

export interface UseLineNumbersOptions {
    /**
     * 节点属性中的行号显示状态
     */
    showLineNumbersAttr?: boolean;

    /**
     * 行号配置
     */
    lineNumbersConfig?: LineNumbersConfig;

    /**
     * 更新属性回调
     */
    onToggle?: (show: boolean) => void;
}

/**
 * 行号状态管理 Hook
 */
export function useLineNumbers(options: UseLineNumbersOptions) {
    const { showLineNumbersAttr, lineNumbersConfig, onToggle } = options;

    // 使用函数式初始化，只在首次渲染时设置值
    const [showLineNumbers, setShowLineNumbers] = useState(
        () => showLineNumbersAttr ?? lineNumbersConfig?.enabled ?? true
    );

    // 切换行号显示
    const toggleLineNumbers = useCallback(() => {
        setShowLineNumbers((prev) => {
            const newValue = !prev;
            onToggle?.(newValue);
            return newValue;
        });
    }, [onToggle]);

    return {
        showLineNumbers,
        toggleLineNumbers,
    };
}
