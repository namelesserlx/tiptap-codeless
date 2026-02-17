import { ImageBubbleMenu } from '@/components/ImageBubbleMenu';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Corner = 'nw' | 'ne' | 'sw' | 'se';

const MIN_SIZE = 40;

export const ResizableImageView: React.FC<NodeViewProps> = ({
    node,
    selected,
    updateAttributes,
    editor,
}) => {
    // 从 editor.storage 获取配置
    const imgBubbleMenuConfig = editor?.storage?.fileUpload?.imgBubbleMenuConfig as
        | {
              enabled?: boolean;
              zIndex?: number;
          }
        | undefined;
    const imgRef = useRef<HTMLImageElement | null>(null);
    const frameRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{
        startX: number;
        startW: number;
        ratio: number;
        corner: Corner;
        maxWidth: number;
    } | null>(null);

    const [bubbleMenuPosition, setBubbleMenuPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const attrs = node.attrs as {
        src: string;
        alt?: string | null;
        title?: string | null;
        width?: number | null;
        height?: number | null;
        align?: 'left' | 'center' | 'right' | null;
    };

    const style = useMemo(() => {
        // 只设置 width，让 height 自动计算以保持宽高比
        const width = attrs.width ? `${attrs.width}px` : undefined;
        return { width } as React.CSSProperties;
    }, [attrs.width]);

    const beginResize = useCallback(
        (corner: Corner) => (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const img = imgRef.current;
            const frame = frameRef.current;
            if (!img || !frame) return;

            // 使用图片的实际显示尺寸（可能被 CSS max-width 限制）
            const rect = img.getBoundingClientRect();
            const startW = rect.width;

            // 使用图片的原始尺寸来计算宽高比，确保比例准确
            const naturalWidth = img.naturalWidth || img.width;
            const naturalHeight = img.naturalHeight || img.height;
            const ratio = naturalHeight > 0 ? naturalWidth / naturalHeight : 1;

            // 获取容器的最大宽度（考虑 max-width: 100% 的限制）
            // frame 的父容器（.tiptap-upload-image）的宽度才是真正的最大宽度限制
            const parentContainer = frame.parentElement;
            const maxWidth = parentContainer
                ? parentContainer.getBoundingClientRect().width
                : frame.getBoundingClientRect().width;

            dragRef.current = {
                startX: e.clientX,
                startW,
                ratio,
                corner,
                maxWidth, // 记录最大宽度限制
            };

            const onMove = (ev: MouseEvent) => {
                if (!dragRef.current) return;
                const { startX, startW, ratio, corner: c, maxWidth: maxW } = dragRef.current;

                const dx = ev.clientX - startX;
                const sign = c === 'ne' || c === 'se' ? 1 : -1;
                let nextW = Math.max(MIN_SIZE, Math.round(startW + sign * dx));

                // 限制宽度不超过容器的最大宽度
                if (nextW > maxW) {
                    nextW = maxW;
                }

                const nextH = Math.max(MIN_SIZE, Math.round(nextW / (ratio || 1)));

                updateAttributes({ width: nextW, height: nextH });

                // 实时更新气泡菜单位置
                requestAnimationFrame(() => {
                    const img = imgRef.current;
                    if (img) {
                        const rect = img.getBoundingClientRect();
                        setBubbleMenuPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 50,
                        });
                    }
                });
            };

            const onUp = () => {
                dragRef.current = null;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },
        [updateAttributes]
    );

    useEffect(() => {
        return () => {
            dragRef.current = null;
        };
    }, []);

    const handleAlignChange = useCallback(
        (align: 'left' | 'center' | 'right') => {
            updateAttributes({ align });
            // 对齐方式改变后，延迟更新菜单位置（等待 DOM 更新）
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const img = imgRef.current;
                    if (img && selected) {
                        const rect = img.getBoundingClientRect();
                        setBubbleMenuPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 50,
                        });
                    }
                });
            });
        },
        [updateAttributes, selected]
    );

    useEffect(() => {
        if (!selected || !imgRef.current) {
            queueMicrotask(() => setBubbleMenuPosition(null));
            return;
        }

        const updatePosition = () => {
            const img = imgRef.current;
            if (!img) return;

            const rect = img.getBoundingClientRect();
            setBubbleMenuPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 50,
            });
        };

        // 初始更新位置（延迟以避免在 effect 内同步 setState）
        queueMicrotask(updatePosition);

        // 延迟更新，确保 DOM 已完全渲染
        const timeoutId = setTimeout(updatePosition, 0);

        // 使用 ResizeObserver 监听图片尺寸变化
        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });
        resizeObserver.observe(imgRef.current);

        // 如果 frame 元素存在，也监听它的变化（对齐方式改变时，frame 位置会变化）
        if (frameRef.current) {
            resizeObserver.observe(frameRef.current);
        }

        // 监听窗口大小变化和滚动
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [selected, attrs.width, attrs.height, attrs.align]);

    const wrapperClassName = useMemo(() => {
        return classNames('tiptap-upload-image', {
            'tiptap-upload-image--align-left': attrs.align === 'left',
            'tiptap-upload-image--align-center': attrs.align === 'center',
            'tiptap-upload-image--align-right': attrs.align === 'right',
        });
    }, [attrs.align]);

    const { enabled = true, zIndex = 1000 } = imgBubbleMenuConfig ?? {};

    return (
        <>
            <NodeViewWrapper className={wrapperClassName}>
                <div
                    ref={frameRef}
                    className={classNames('tiptap-upload-image__frame', {
                        'tiptap-upload-image__frame--selected': selected,
                    })}
                >
                    <img
                        ref={imgRef}
                        className="tiptap-upload-image__img"
                        src={attrs.src}
                        alt={attrs.alt ?? ''}
                        title={attrs.title ?? undefined}
                        draggable={false}
                        style={style}
                    />

                    {selected && (
                        <>
                            <div className="tiptap-upload-image__handles">
                                <button
                                    type="button"
                                    className="tiptap-upload-image__handle tiptap-upload-image__handle--nw"
                                    onMouseDown={beginResize('nw')}
                                />
                                <button
                                    type="button"
                                    className="tiptap-upload-image__handle tiptap-upload-image__handle--ne"
                                    onMouseDown={beginResize('ne')}
                                />
                                <button
                                    type="button"
                                    className="tiptap-upload-image__handle tiptap-upload-image__handle--sw"
                                    onMouseDown={beginResize('sw')}
                                />
                                <button
                                    type="button"
                                    className="tiptap-upload-image__handle tiptap-upload-image__handle--se"
                                    onMouseDown={beginResize('se')}
                                />
                            </div>
                        </>
                    )}
                </div>
            </NodeViewWrapper>

            {/* 气泡菜单 */}
            {selected &&
                editor &&
                enabled &&
                bubbleMenuPosition &&
                createPortal(
                    <div
                        className="tiptap-image-bubble-menu-wrapper"
                        style={{
                            position: 'fixed',
                            left: `${bubbleMenuPosition.x}px`,
                            top: `${bubbleMenuPosition.y}px`,
                            transform: 'translateX(-50%)',
                            zIndex,
                        }}
                    >
                        <ImageBubbleMenu
                            align={attrs.align ?? null}
                            onAlignChange={handleAlignChange}
                        />
                    </div>,
                    document.body
                )}
        </>
    );
};
