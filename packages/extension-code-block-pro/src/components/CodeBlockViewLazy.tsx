import classNames from 'classnames';
import React from 'react';

export interface CodeBlockViewLazyProps {
    placeholderHeight: number;
    theme: string;
    label: string;
    lazyRef: React.RefObject<HTMLDivElement | null>;
}

const CodeBlockPlaceholder: React.FC<{
    placeholderHeight: number;
    theme: string;
    label: string;
}> = ({ placeholderHeight, theme, label }) => (
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
        <span>{label}</span>
    </div>
);

export const CodeBlockViewLazy: React.FC<CodeBlockViewLazyProps> = ({
    placeholderHeight,
    theme,
    label,
    lazyRef,
}) => {
    return (
        <div ref={lazyRef}>
            <CodeBlockPlaceholder
                placeholderHeight={placeholderHeight}
                theme={theme}
                label={label}
            />
        </div>
    );
};

CodeBlockViewLazy.displayName = 'CodeBlockViewLazy';
