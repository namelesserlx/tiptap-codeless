import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useRef } from 'react';

import { useLazyRender } from '@/hooks';
import type { CodeBlockViewProps } from '@/types';
import { CodeBlockViewFull } from '@/components/CodeBlockViewFull';

/**
 * 占位符 - 未进入视口时显示
 */
const CodeBlockPlaceholder: React.FC<{
    language?: string | null;
    placeholderHeight: number;
    theme: string;
}> = ({ language, placeholderHeight, theme }) => (
    <div
        className={classNames('code-block-pro-placeholder', `theme-${theme}`)}
        style={{
            minHeight: placeholderHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--cbp-bg, #f5f5f5)',
            borderRadius: '8px',
            color: 'var(--cbp-text-secondary, #666)',
            fontSize: '14px',
        }}
    >
        <span>{language ? `${language} 代码块` : '代码块'}</span>
    </div>
);

export const CodeBlockViewLazy: React.FC<CodeBlockViewProps> = (props) => {
    const { node, extension } = props;
    const { language, theme } = node.attrs;
    const options = extension.options;
    const lazyConfig = options.lazyRender;
    const placeholderHeight = lazyConfig?.placeholderHeight ?? 100;
    const rootMargin = lazyConfig?.rootMargin ?? '100px';
    const effectiveTheme = theme || options.theme || 'auto';

    const wrapperRef = useRef<HTMLDivElement>(null);
    const { ref: lazyRef, hasBeenVisible } = useLazyRender({
        enabled: true,
        rootMargin,
    });

    // 进入视口后渲染完整组件（此时才执行 useCodeBlock、useCollapse 等所有 hooks）
    if (hasBeenVisible) {
        return <CodeBlockViewFull {...props} />;
    }

    return (
        <NodeViewWrapper
            ref={wrapperRef}
            className={classNames(
                'code-block-pro-wrapper',
                'is-lazy-placeholder',
                `theme-${effectiveTheme}`,
                options.className
            )}
            data-language={language}
        >
            <div ref={lazyRef}>
                <CodeBlockPlaceholder
                    language={language}
                    placeholderHeight={placeholderHeight}
                    theme={effectiveTheme}
                />
            </div>
            <div style={{ display: 'none' }}>
                <NodeViewContent />
            </div>
        </NodeViewWrapper>
    );
};

CodeBlockViewLazy.displayName = 'CodeBlockViewLazy';
