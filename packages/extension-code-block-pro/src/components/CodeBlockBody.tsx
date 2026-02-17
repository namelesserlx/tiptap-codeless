import React from 'react';
import { useConfigContext, useMermaidContext, useStateContext } from '@/contexts';
import { CodeContent } from '@/components/CodeContent';
import { LineNumbers } from '@/components/LineNumbers';
import { MermaidDiagram } from '@/components/MermaidDiagram';

export const CodeBlockBody: React.FC = () => {
    const { nodeAttrs, options, theme, contentRef, getCodeContent, diagramFromHeightRef } =
        useConfigContext();

    const { isCollapsed, showLineNumbers, collapsedLines } = useStateContext();

    const { isMermaid, isShowingMermaidDiagram } = useMermaidContext();

    const content = getCodeContent();
    const startLine = options.lineNumbers?.startLine ?? 1;
    const showMermaidDiagram = nodeAttrs.showMermaidDiagram ?? false;
    if (isShowingMermaidDiagram) {
        return (
            <MermaidDiagram
                isMermaid={isMermaid}
                content={content}
                showDiagram={showMermaidDiagram}
                theme={theme}
                isCollapsed={isCollapsed}
                diagramFromHeightRef={diagramFromHeightRef}
            />
        );
    }

    return (
        <>
            {/* 行号 - 内部自动计算行数，不依赖 context */}
            {showLineNumbers && (
                <LineNumbers
                    contentRef={contentRef}
                    startLine={startLine}
                    isCollapsed={isCollapsed}
                    collapsedLines={collapsedLines}
                />
            )}

            {/* 代码内容 */}
            <CodeContent
                contentRef={contentRef}
                isCollapsed={isCollapsed}
                collapsedLines={collapsedLines}
            />
        </>
    );
};

CodeBlockBody.displayName = 'CodeBlockBody';
