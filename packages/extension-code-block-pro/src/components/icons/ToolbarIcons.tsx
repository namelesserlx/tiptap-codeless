/**
 * 工具栏图标组件
 */

import React from 'react';

export interface IconProps {
    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * 复制图标（默认状态）
 */
export const CopyIcon: React.FC<IconProps> = ({ className = 'icon' }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
            />
        </svg>
    );
};

/**
 * 复制成功图标
 */
export const CopySuccessIcon: React.FC<IconProps> = ({ className = 'icon' }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );
};

/**
 * 下拉箭头图标
 */
export const ChevronDownIcon: React.FC<IconProps & { isOpen?: boolean }> = ({
    className = 'arrow-icon',
    isOpen = false,
}) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
};

/**
 * 行号切换图标
 */
export const LineNumbersIcon: React.FC<IconProps> = ({ className = 'icon' }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="4" y1="6" x2="4" y2="6" strokeWidth={2} strokeLinecap="round" />
            <line x1="8" y1="6" x2="20" y2="6" strokeWidth={2} strokeLinecap="round" />
            <line x1="4" y1="12" x2="4" y2="12" strokeWidth={2} strokeLinecap="round" />
            <line x1="8" y1="12" x2="20" y2="12" strokeWidth={2} strokeLinecap="round" />
            <line x1="4" y1="18" x2="4" y2="18" strokeWidth={2} strokeLinecap="round" />
            <line x1="8" y1="18" x2="20" y2="18" strokeWidth={2} strokeLinecap="round" />
        </svg>
    );
};

/**
 * 代码图标
 */
export const CodeIcon: React.FC<IconProps> = ({ className = 'icon' }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
        </svg>
    );
};

/**
 * Mermaid 图表图标（流程图样式）
 */
export const MermaidDiagramIcon: React.FC<IconProps> = ({ className = 'icon' }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <circle cx="15" cy="9" r="2" />
            <circle cx="9" cy="15" r="2" />
            <circle cx="15" cy="15" r="2" />
            <line x1="9" y1="11" x2="15" y2="11" />
            <line x1="11" y1="9" x2="11" y2="15" />
            <line x1="13" y1="9" x2="13" y2="15" />
        </svg>
    );
};
