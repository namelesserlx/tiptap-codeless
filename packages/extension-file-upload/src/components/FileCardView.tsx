import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { formatBytes } from '../utils/file';

// 下载图标组件
const DownloadIcon: React.FC = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// 文件类型图标组件
const FileTypeIcon: React.FC<{ mimeType?: string }> = ({ mimeType }) => {
    // 根据 MIME 类型返回不同的标签
    const label = useMemo(() => {
        if (!mimeType) return 'FILE';
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLS';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive'))
            return 'ZIP';
        if (mimeType.includes('text')) return 'TXT';
        return 'FILE';
    }, [mimeType]);

    return <span className="tiptap-upload-file__icon-inner">{label}</span>;
};

export const FileCardView: React.FC<NodeViewProps> = ({ node, selected }) => {
    const attrs = node.attrs as {
        url: string;
        name: string;
        mimeType: string;
        size: number;
    };

    const meta = useMemo(() => {
        const parts: string[] = [];
        if (attrs.mimeType) parts.push(attrs.mimeType);
        if (attrs.size) parts.push(formatBytes(attrs.size));
        return parts.join(' · ');
    }, [attrs.mimeType, attrs.size]);

    const handleDownload = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // 创建临时链接并触发下载
            const link = document.createElement('a');
            link.href = attrs.url;
            link.download = attrs.name || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        [attrs.url, attrs.name]
    );

    return (
        <NodeViewWrapper className="tiptap-upload-file">
            <div
                className={classNames('tiptap-upload-file__card', {
                    'tiptap-upload-file__card--selected': selected,
                })}
            >
                <div className="tiptap-upload-file__icon" aria-hidden="true">
                    <FileTypeIcon mimeType={attrs.mimeType} />
                </div>
                <div className="tiptap-upload-file__content">
                    <div className="tiptap-upload-file__name">{attrs.name || '未命名文件'}</div>
                    {meta && <div className="tiptap-upload-file__meta">{meta}</div>}
                </div>
                <button
                    type="button"
                    className="tiptap-upload-file__download"
                    onClick={handleDownload}
                    title="下载文件"
                >
                    <DownloadIcon />
                </button>
            </div>
        </NodeViewWrapper>
    );
};
