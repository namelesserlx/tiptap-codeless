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

    // 使用函数式初始化，只在首次渲染时设置值
    const [isCollapsed, setIsCollapsed] = useState(() => defaultCollapsed);

    // 切换折叠状态
    const toggle = useCallback(() => {
        setIsCollapsed((prev) => {
            const newValue = !prev;
            onCollapsedChange?.(newValue);
            return newValue;
        });
    }, [onCollapsedChange]);

    // 展开
    const expand = useCallback(() => {
        setIsCollapsed(false);
        onCollapsedChange?.(false);
    }, [onCollapsedChange]);

    // 折叠
    const collapse = useCallback(() => {
        setIsCollapsed(true);
        onCollapsedChange?.(true);
    }, [onCollapsedChange]);

    return {
        isCollapsed,
        collapsedLines,
        toggle,
        expand,
        collapse,
    };
}
