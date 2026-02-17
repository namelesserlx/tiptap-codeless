import classNames from 'classnames';
import React from 'react';
import { useMermaid } from '@/hooks/useMermaid';
import type { CodeBlockTheme } from '@/types';

export interface MermaidDiagramProps {
    /**
     * 是否为 Mermaid 代码块
     */
    isMermaid: boolean;

    /**
     * 代码内容
     */
    content: string;

    /**
     * 是否显示图表
     */
    showDiagram: boolean;

    /**
     * 主题
     */
    theme: CodeBlockTheme;

    /**
     * 是否折叠
     */
    isCollapsed?: boolean;

    /**
     * 切换为图表前写入的代码区高度（ref），用于从该高度平滑展开
     */
    diagramFromHeightRef?: React.MutableRefObject<number>;
}

/**
 * Mermaid 图表组件
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
    isMermaid,
    content,
    showDiagram,
    theme,
    isCollapsed,
    diagramFromHeightRef,
}) => {
    const { mermaidRef, isExpanded } = useMermaid({
        isMermaid,
        content,
        showDiagram,
        theme,
        diagramFromHeightRef,
    });
    // 不判断 mermaidRef.current，否则首屏 ref 未挂载会一直 return null，div 永远不会渲染
    if (!isMermaid || !showDiagram) {
        return null;
    }

    return (
        <div
            className={classNames('mermaid-container', {
                'is-collapsed': isCollapsed,
                'is-expanded': isExpanded,
            })}
            ref={mermaidRef}
        />
    );
};

MermaidDiagram.displayName = 'MermaidDiagram';
