import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useLineCount } from '@/hooks';

export interface LineNumbersProps {
    /**
     * 内容元素的 ref，用于计算行数
     */
    contentRef: React.RefObject<HTMLElement | null>;

    /**
     * 起始行号
     */
    startLine?: number;

    /**
     * 是否折叠
     */
    isCollapsed?: boolean;

    /**
     * 折叠时显示的行数
     */
    collapsedLines?: number;

    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * 行号组件
 * 内部自动计算行数，避免依赖 context 导致不必要的重新渲染
 */
export const LineNumbers: React.FC<LineNumbersProps> = React.memo(
    ({ contentRef, startLine = 1, isCollapsed, collapsedLines = 3, className }) => {
        const lineCount = useLineCount(contentRef, 1);

        // 计算要显示的行号
        // 至少显示一行行号（即使内容为空）
        const lineNumbers = useMemo(() => {
            const displayCount = isCollapsed ? Math.min(collapsedLines, lineCount) : lineCount;
            return Array.from({ length: Math.max(1, displayCount) }, (_, i) => startLine + i);
        }, [lineCount, startLine, isCollapsed, collapsedLines]);

        return (
            <div className={classNames('line-numbers', className)} aria-hidden="true">
                {lineNumbers.map((num) => (
                    <div key={num} className="line-number">
                        {num}
                    </div>
                ))}
            </div>
        );
    }
);

LineNumbers.displayName = 'LineNumbers';
