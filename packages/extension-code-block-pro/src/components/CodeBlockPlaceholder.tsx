import classNames from 'classnames';
import React from 'react';

export interface CodeBlockPlaceholderProps {
    placeholderHeight: number;
    theme: string;
    label: string;
}

export const CodeBlockPlaceholder: React.FC<CodeBlockPlaceholderProps> = ({
    placeholderHeight,
    theme,
    label,
}) => (
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

CodeBlockPlaceholder.displayName = 'CodeBlockPlaceholder';
