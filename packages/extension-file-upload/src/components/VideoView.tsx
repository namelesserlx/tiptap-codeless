import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useMemo } from 'react';

export const VideoView: React.FC<NodeViewProps> = ({ node, selected }) => {
    const attrs = node.attrs as {
        src: string;
        title?: string | null;
        width?: number | null;
        height?: number | null;
    };

    const style = useMemo(() => {
        const width = attrs.width ? `${attrs.width}px` : undefined;
        const height = attrs.height ? `${attrs.height}px` : undefined;
        return { width, height } as React.CSSProperties;
    }, [attrs.width, attrs.height]);

    return (
        <NodeViewWrapper className="tiptap-upload-video">
            <div
                className={classNames('tiptap-upload-video__frame', {
                    'tiptap-upload-video__frame--selected': selected,
                })}
            >
                <video
                    className="tiptap-upload-video__video"
                    controls
                    preload="metadata"
                    src={attrs.src}
                    title={attrs.title ?? undefined}
                    style={style}
                />
            </div>
        </NodeViewWrapper>
    );
};
