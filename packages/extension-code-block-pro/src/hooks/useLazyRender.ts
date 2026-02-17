/**
 * 延迟渲染 Hook - 使用 IntersectionObserver 实现懒加载
 * 只有当元素进入视口时才渲染完整内容
 */

import { useEffect, useRef, useState } from 'react';

export interface UseLazyRenderOptions {
    /**
     * 根元素（用于计算交叉）
     */
    root?: Element | null;

    /**
     * 根边距，可以扩大或缩小交叉检测的范围
     * 例如 "100px" 表示提前 100px 开始加载
     */
    rootMargin?: string;

    /**
     * 触发回调的交叉比例阈值
     */
    threshold?: number | number[];

    /**
     * 是否启用延迟渲染（可以通过配置禁用）
     */
    enabled?: boolean;
}

/**
 * 延迟渲染 Hook
 * @returns [ref, isVisible] - ref 需要绑定到占位元素，isVisible 表示是否应该渲染完整内容
 */
export function useLazyRender(options: UseLazyRenderOptions = {}) {
    const {
        root = null,
        rootMargin = '100px', // 提前 100px 开始渲染
        threshold = 0,
        enabled = true,
    } = options;

    const [isVisible, setIsVisible] = useState(!enabled); // 如果禁用，默认可见
    const [hasBeenVisible, setHasBeenVisible] = useState(!enabled); // 是否曾经可见（用于保持渲染状态）
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled) {
            queueMicrotask(() => {
                setIsVisible(true);
                setHasBeenVisible(true);
            });
            return;
        }

        const element = elementRef.current;
        if (!element) return;

        // 检查浏览器是否支持 IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            queueMicrotask(() => {
                setIsVisible(true);
                setHasBeenVisible(true);
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        setHasBeenVisible(true);
                        // 一旦可见，停止观察（保持渲染状态）
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root, rootMargin, threshold }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [enabled, root, rootMargin, threshold]);

    return {
        ref: elementRef,
        isVisible,
        hasBeenVisible,
    };
}
