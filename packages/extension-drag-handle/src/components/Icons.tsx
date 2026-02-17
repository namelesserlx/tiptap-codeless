/**
 * 图标组件
 */

import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
}

/**
 * 抓手图标（六点网格）
 */
export const GripIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="11" cy="4" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="11" cy="12" r="1.5" />
    </svg>
);

/**
 * 加号图标
 */
export const PlusIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        xmlns="http://www.w3.org/2000/svg"
    >
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
);

/**
 * 段落图标
 */
export const ParagraphIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M6.5 2h6a.5.5 0 010 1H11v11a.5.5 0 01-1 0V3H8v11a.5.5 0 01-1 0V8H6.5a3 3 0 010-6z" />
    </svg>
);

/**
 * 标题图标
 */
export const HeadingIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M2 2.5a.5.5 0 01.5-.5h3a.5.5 0 010 1H4v4h4V3h-.5a.5.5 0 010-1h2a.5.5 0 010 1H9v10h.5a.5.5 0 010 1h-3a.5.5 0 010-1H8V8H4v5h.5a.5.5 0 010 1h-2a.5.5 0 010-1H3V3h-.5a.5.5 0 01-.5-.5z" />
        <path d="M11.5 2a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm0 3a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm.5 3.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" />
    </svg>
);

/**
 * 列表图标
 */
export const ListIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="2.5" cy="4" r="1.5" />
        <circle cx="2.5" cy="8" r="1.5" />
        <circle cx="2.5" cy="12" r="1.5" />
        <rect x="5" y="3" width="10" height="2" rx="0.5" />
        <rect x="5" y="7" width="10" height="2" rx="0.5" />
        <rect x="5" y="11" width="10" height="2" rx="0.5" />
    </svg>
);

/**
 * 代码块图标
 */
export const CodeIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5.854 4.146a.5.5 0 010 .708L2.707 8l3.147 3.146a.5.5 0 01-.708.708l-3.5-3.5a.5.5 0 010-.708l3.5-3.5a.5.5 0 01.708 0zm4.292 0a.5.5 0 000 .708L13.293 8l-3.147 3.146a.5.5 0 00.708.708l3.5-3.5a.5.5 0 000-.708l-3.5-3.5a.5.5 0 00-.708 0z" />
    </svg>
);

/**
 * 引用图标
 */
export const QuoteIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M3.5 6a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h2a.5.5 0 00.5-.5V9a.5.5 0 00-.5-.5h-1V7h1a.5.5 0 000-1h-2zm6 0a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h2a.5.5 0 00.5-.5V9a.5.5 0 00-.5-.5h-1V7h1a.5.5 0 000-1h-2z" />
    </svg>
);

/**
 * 图片图标
 */
export const ImageIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M1 3a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H3z" />
        <path d="M10.5 5a1 1 0 11-2 0 1 1 0 012 0z" />
        <path d="M2.707 12.293l3-3a1 1 0 011.414 0L9 11.172l1.879-1.879a1 1 0 011.414 0l1.414 1.414a.5.5 0 01-.707.707L12 10.414l-1.879 1.879a1 1 0 01-1.414 0L6.828 10.414l-2.828 2.829a.5.5 0 11-.707-.708z" />
    </svg>
);

/**
 * 分割线图标
 */
export const DividerIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="1" y="7" width="14" height="2" rx="1" />
    </svg>
);

/**
 * 表格图标
 */
export const TableIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M0 2a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 001-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 001 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z" />
    </svg>
);
