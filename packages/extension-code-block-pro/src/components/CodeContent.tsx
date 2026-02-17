import { NodeViewContent } from '@tiptap/react';
import classNames from 'classnames';
import React from 'react';
import { useConfigContext } from '@/contexts';

export interface CodeContentProps {
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

    /**
     * 内容 ref
     */
    contentRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 代码内容组件
 * 使用标准的 <pre><code></code></pre> HTML 结构
 */
export const CodeContent: React.FC<CodeContentProps> = React.memo(
    ({ isCollapsed, collapsedLines = 3, className, contentRef }) => {
        const { currentLanguage } = useConfigContext();

        return (
            <div
                ref={contentRef}
                className={classNames('code-content', className, {
                    'is-collapsed': isCollapsed,
                })}
                style={
                    isCollapsed
                        ? {
                              maxHeight: `${collapsedLines * 1.5}em`, // 假设每行高度约 1.5em
                              overflow: 'hidden',
                          }
                        : undefined
                }
            >
                <pre>
                    <code
                        className={
                            currentLanguage.value ? `language-${currentLanguage.value}` : undefined
                        }
                    >
                        <NodeViewContent />
                    </code>
                </pre>
            </div>
        );
    }
);

CodeContent.displayName = 'CodeContent';
