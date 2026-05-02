/**
 * 折叠功能 Hook
 */

import { useCallback, useState } from 'react';

export interface UseCollapseOptions {
    /**
     * 默认是否折叠（仅作为初始值）
     */
    defaultCollapsed?: boolean;

    /**
     * 折叠时显示的行数
     */
    collapsedLines?: number;

    /**
     * 折叠状态变化回调
     */
    onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * 折叠功能 Hook
 */
export function useCollapse(options: UseCollapseOptions = {}) {
    const { defaultCollapsed = false, collapsedLines = 3, onCollapsedChange } = options;

    const [collapsedState, setCollapsedState] = useState(() => ({
        source: defaultCollapsed,
        value: defaultCollapsed,
    }));
    const isCollapsed =
        collapsedState.source === defaultCollapsed ? collapsedState.value : defaultCollapsed;

    // 切换折叠状态
    const toggle = useCallback(() => {
        setCollapsedState((current) => {
            const currentValue =
                current.source === defaultCollapsed ? current.value : defaultCollapsed;
            const newValue = !currentValue;
            onCollapsedChange?.(newValue);
            return {
                source: defaultCollapsed,
                value: newValue,
            };
        });
    }, [defaultCollapsed, onCollapsedChange]);

    // 展开
    const expand = useCallback(() => {
        setCollapsedState({
            source: defaultCollapsed,
            value: false,
        });
        onCollapsedChange?.(false);
    }, [defaultCollapsed, onCollapsedChange]);

    // 折叠
    const collapse = useCallback(() => {
        setCollapsedState({
            source: defaultCollapsed,
            value: true,
        });
        onCollapsedChange?.(true);
    }, [defaultCollapsed, onCollapsedChange]);

    return {
        isCollapsed,
        collapsedLines,
        toggle,
        expand,
        collapse,
    };
}
