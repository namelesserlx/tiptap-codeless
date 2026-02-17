/**
 * Mermaid 图表逻辑 Hook
 */

import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CodeBlockTheme } from '@/types';

/** 高度变化超过此阈值（px）时才执行动画，避免小幅抖动也过渡 */
const HEIGHT_CHANGE_THRESHOLD = 30;
/** 高度过渡动画时长（ms） */
const HEIGHT_TRANSITION_MS = 280;

export interface UseMermaidOptions {
    /**
     * 是否为 Mermaid 代码块
     */
    isMermaid: boolean;

    /**
     * 代码内容
     */
    content: string;

    /**
     * 是否显示图表
     */
    showDiagram: boolean;

    /**
     * 主题
     */
    theme: CodeBlockTheme;

    /**
     * 切换为图表前写入的代码区高度（ref），首次展开从该高度过渡到图表高度，避免整体先塌再撑
     */
    diagramFromHeightRef?: MutableRefObject<number>;
}

/**
 * Mermaid 图表逻辑 Hook
 */
export function useMermaid(options: UseMermaidOptions) {
    const { isMermaid, content, showDiagram, theme, diagramFromHeightRef } = options;

    const mermaidRef = useRef<HTMLDivElement>(null);
    const mermaidIdRef = useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
    /** 是否已完成首次展开动画，用于区分首次显示与后续内容变更 */
    const hasAnimatedInRef = useRef(false);
    /** 是否已展开（用于控制内容可见性，通过返回值传给组件的 className） */
    const [isExpanded, setIsExpanded] = useState(false);
    /** 缓存有效内容，避免因 DOM 未渲染导致 getCodeContent() 返回空时丢失内容 */
    const cachedContentRef = useRef<string>('');
    /** 上一次渲染的内容，用于判断是否需要重新渲染 */
    const lastRenderedContentRef = useRef<string>('');

    // 关闭图表视图时重置状态
    useEffect(() => {
        if (!showDiagram) {
            hasAnimatedInRef.current = false;
            cachedContentRef.current = '';
            lastRenderedContentRef.current = '';
            setIsExpanded(false);
        }
    }, [showDiagram]);

    // 首次显示图表时在首帧锁定高度：有 diagramFromHeight 则从代码区高度开始，否则从 0，避免整体先塌再撑
    useLayoutEffect(() => {
        if (!isMermaid || !showDiagram || hasAnimatedInRef.current || !mermaidRef.current) return;
        const el = mermaidRef.current;
        const startHeight = diagramFromHeightRef?.current ?? 0;
        el.style.height = `${startHeight}px`;
        el.style.overflow = 'hidden';
        el.style.minHeight = '0';
    }, [isMermaid, showDiagram, diagramFromHeightRef]);

    const wrapContent = (html: string) => `<div class="mermaid-container__content">${html}</div>`;

    /**
     * 注入图表内容并按需进行高度过渡。
     * 首次显示：从代码区高度过渡到图表高度，并在结束后渐显内容。
     * 后续更新：仅在高度变化较大时过渡，避免突兀跳变。
     */
    const renderWithHeightTransition = useCallback(
        (html: string) => {
            const el = mermaidRef.current;
            if (!el) return;

            const shouldAnimateIn = !hasAnimatedInRef.current;
            const fromHeight = shouldAnimateIn
                ? (diagramFromHeightRef?.current ?? 0)
                : el.scrollHeight;

            el.style.overflow = 'hidden';
            el.style.minHeight = '0';
            el.style.height = `${fromHeight}px`;

            if (shouldAnimateIn) {
                setIsExpanded(false);
            }

            requestAnimationFrame(() => {
                if (!mermaidRef.current) return;
                el.innerHTML = wrapContent(html);

                requestAnimationFrame(() => {
                    if (!mermaidRef.current) return;
                    const targetHeight = el.scrollHeight;
                    const delta = Math.abs(targetHeight - fromHeight);
                    const shouldAnimateHeight = shouldAnimateIn || delta > HEIGHT_CHANGE_THRESHOLD;

                    if (!shouldAnimateHeight) {
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.minHeight = '';
                        return;
                    }

                    el.style.transition = `height ${HEIGHT_TRANSITION_MS}ms ease-out`;
                    el.style.height = `${targetHeight}px`;

                    let cleaned = false;
                    const cleanup = () => {
                        if (cleaned) return;
                        cleaned = true;
                        if (!mermaidRef.current) return;
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.minHeight = '';
                        el.style.transition = '';
                        el.removeEventListener('transitionend', cleanup);
                        if (shouldAnimateIn) {
                            hasAnimatedInRef.current = true;
                            setIsExpanded(true);
                        }
                    };
                    el.addEventListener('transitionend', cleanup);
                    setTimeout(cleanup, HEIGHT_TRANSITION_MS + 50);
                });
            });
        },
        [diagramFromHeightRef]
    );

    // 渲染 Mermaid 图表
    useEffect(() => {
        if (!isMermaid || !showDiagram) {
            return;
        }

        const trimmedContent = content.trim();
        // 有新内容时更新缓存；内容为空时使用缓存（避免因 DOM 未渲染导致的误判）
        if (trimmedContent) {
            cachedContentRef.current = trimmedContent;
        }
        const effectiveContent = trimmedContent || cachedContentRef.current;

        // 如果内容与上次相同且已完成首次动画，跳过重新渲染（避免折叠等状态变化触发不必要的渲染）
        if (effectiveContent === lastRenderedContentRef.current && hasAnimatedInRef.current) {
            return;
        }

        // 如果内容为空（真的没有内容），显示提示信息
        if (!effectiveContent) {
            const emptyHtml = `
        <div class="mermaid-empty" style="
          padding: 20px;
          margin: 10px;
          text-align: center;
          color: var(--cbp-text-secondary, #666);
          font-size: 14px;
        ">
          代码为空，请输入 Mermaid 代码
        </div>
      `;
            const t = requestAnimationFrame(() => {
                if (!mermaidRef.current) return;
                renderWithHeightTransition(emptyHtml);
            });
            return () => cancelAnimationFrame(t);
        }

        let cancelled = false;

        const renderMermaid = async () => {
            try {
                const mermaid = (await import('mermaid')).default;
                if (cancelled) return;

                mermaid.initialize({
                    startOnLoad: false,
                    theme: theme === 'dark' ? 'dark' : 'default',
                    securityLevel: 'loose',
                });

                const id = mermaidIdRef.current;
                const { svg } = await mermaid.render(id, effectiveContent);

                if (cancelled || !mermaidRef.current) return;
                renderWithHeightTransition(svg);
                lastRenderedContentRef.current = effectiveContent;
            } catch (error) {
                if (cancelled) return;
                console.error('Mermaid render error:', error);
                if (mermaidRef.current) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    const errorHtml = `
            <div class="mermaid-error" style="
              padding: 20px;
              margin: 10px;
              background-color: var(--cbp-error-bg, #fee);
              border: 1px solid var(--cbp-error-border, #fcc);
              border-radius: 4px;
              color: var(--cbp-error-text, #c33);
              font-family: monospace;
              font-size: 14px;
              line-height: 1.5;
            ">
              <div style="font-weight: bold; margin-bottom: 8px;">Mermaid 渲染错误</div>
              <div>${errorMessage}</div>
            </div>
          `;
                    renderWithHeightTransition(errorHtml);
                }
            }
        };

        renderMermaid();

        return () => {
            cancelled = true;
        };
    }, [isMermaid, showDiagram, content, theme, renderWithHeightTransition]);

    return {
        mermaidRef,
        isExpanded,
    };
}
