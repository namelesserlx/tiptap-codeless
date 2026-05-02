/**
 * 行号状态管理 Hook
 */

import { useCallback, useMemo, useState } from 'react';
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
    const resolvedShowLineNumbers = useMemo(
        () => showLineNumbersAttr ?? lineNumbersConfig?.enabled ?? true,
        [showLineNumbersAttr, lineNumbersConfig?.enabled]
    );

    const [lineNumbersState, setLineNumbersState] = useState(() => ({
        source: resolvedShowLineNumbers,
        value: resolvedShowLineNumbers,
    }));
    const showLineNumbers =
        lineNumbersState.source === resolvedShowLineNumbers
            ? lineNumbersState.value
            : resolvedShowLineNumbers;

    // 切换行号显示
    const toggleLineNumbers = useCallback(() => {
        setLineNumbersState((current) => {
            const currentValue =
                current.source === resolvedShowLineNumbers
                    ? current.value
                    : resolvedShowLineNumbers;
            const newValue = !currentValue;
            onToggle?.(newValue);
            return {
                source: resolvedShowLineNumbers,
                value: newValue,
            };
        });
    }, [onToggle, resolvedShowLineNumbers]);

    return {
        showLineNumbers,
        toggleLineNumbers,
    };
}
