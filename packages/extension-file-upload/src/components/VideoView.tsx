import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useMemo, useSyncExternalStore } from 'react';
import { useResolvedAssetUrl } from '@/hooks/useResolvedAssetUrl';

export const VideoView: React.FC<NodeViewProps> = ({ node, selected, editor }) => {
    const isEditable = useSyncExternalStore(
        (callback) => {
            if (!editor || typeof editor.on !== 'function') {
                return () => {};
            }
            editor.on('update', callback);
            return () => {
                editor.off('update', callback);
            };
        },
        () => editor?.isEditable ?? true
    );
    const attrs = node.attrs as {
        src: string;
        title?: string | null;
        width?: number | null;
        height?: number | null;
        fileName?: string | null;
        storageMode?: 'memory' | 'base64' | 'local' | 'custom' | null;
        storageKey?: string | null;
    };
    const resolvedUrl = useResolvedAssetUrl(editor ?? null, {
        url: attrs.src,
        fileName: attrs.fileName,
        storageMode: attrs.storageMode ?? undefined,
        storageKey: attrs.storageKey,
    });

    const style = useMemo(() => {
        const width = attrs.width ? `${attrs.width}px` : undefined;
        const height = attrs.height ? `${attrs.height}px` : undefined;
        return { width, height } as React.CSSProperties;
    }, [attrs.width, attrs.height]);

    return (
        <NodeViewWrapper className="tiptap-upload-video" draggable={isEditable}>
            <div
                className={classNames('tiptap-upload-video__frame', {
                    'tiptap-upload-video__frame--selected': selected && isEditable,
                })}
            >
                <video
                    className="tiptap-upload-video__video"
                    controls
                    preload="metadata"
                    src={resolvedUrl}
                    title={attrs.title ?? undefined}
                    style={style}
                />
            </div>
        </NodeViewWrapper>
    );
};
