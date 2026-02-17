import React from 'react';
import { useConfigContext, useMermaidContext, useStateContext } from '@/contexts';
import { useLineCount } from '@/hooks';

/**
 * 折叠展开按钮组件
 * 内部自动计算行数，避免依赖 context 导致不必要的重新渲染
 */
export const ExpandButton: React.FC = () => {
    const { contentRef } = useConfigContext();

    const { isCollapsed, isCollapsible, toggleCollapse } = useStateContext();

    const { isShowingMermaidDiagram } = useMermaidContext();

    const lineCount = useLineCount(contentRef, 0);

    if (!isCollapsed || !isCollapsible) {
        return null;
    }

    const label = isShowingMermaidDiagram
        ? '展开图表'
        : lineCount > 0
          ? `展开全部 (${lineCount} 行)`
          : '展开全部';

    return (
        <button type="button" className="expand-button" onClick={toggleCollapse} aria-label={label}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
            <span>{label}</span>
        </button>
    );
};

ExpandButton.displayName = 'ExpandButton';
