/**
 * 位置计算工具函数
 */

import type { EditorView } from '@tiptap/pm/view';
import type { CurrentNodeInfo, DragHandleOptions } from '../types';

/**
 * 手柄位置信息
 */
export interface HandlePosition {
    /** 左边距 */
    left: number;
    /** 顶边距 */
    top: number;
    /** 是否可见 */
    visible: boolean;
}

/**
 * 计算拖拽手柄的位置
 */
export function calculateHandlePosition(
    nodeInfo: CurrentNodeInfo,
    view: EditorView,
    options: DragHandleOptions
): HandlePosition {
    const { rect, node } = nodeInfo;
    const editorRect = view.dom.getBoundingClientRect();
    const parentRect = view.dom.parentElement?.getBoundingClientRect() || editorRect;

    const offsetX = options.offset?.x ?? -32;
    const offsetY = options.offset?.y ?? 0;
    const nodeType = node.type?.name;
    const centerAlignedTypes = new Set(['paragraph', 'heading']);
    const isCenterAligned = centerAlignedTypes.has(nodeType);
    const left = rect.left + offsetX;
    const centerTop =
        rect.top + rect.height / 2 - (options.handleStyle?.height ?? 24) / 2 + offsetY;
    const firstLineTop = rect.top + offsetY;
    const top = isCenterAligned ? centerTop : firstLineTop;

    // 检查是否在可见区域内
    const visible = rect.top >= parentRect.top && rect.bottom <= parentRect.bottom + 100;

    return {
        left,
        top,
        visible,
    };
}

/**
 * 计算插入菜单的位置
 * @param triggerRect 触发元素的边界信息
 * @param menuRect 菜单的边界信息
 * @param viewportRect 视口的边界信息
 * @param options 位置配置
 * @returns 计算后的位置和实际使用的放置方向
 */
export function calculateMenuPosition(
    triggerRect: DOMRect,
    menuRect: DOMRect,
    viewportRect: DOMRect,
    options?: {
        placement?: 'right' | 'left' | 'bottom' | 'top';
        offset?: { x?: number; y?: number };
    }
): { x: number; y: number; placement: 'right' | 'left' | 'bottom' | 'top' } {
    const gap = 4;

    const preferred = options?.placement ?? 'left';
    const offsetX = options?.offset?.x ?? 0;
    const offsetY = options?.offset?.y ?? 0;

    // 以触发按钮中心点做对齐：左右方向垂直居中，上下方向水平居中。
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    const computePreferred = (placement: 'right' | 'left' | 'bottom' | 'top') => {
        switch (placement) {
            case 'right':
                return {
                    x: triggerRect.right + gap,
                    y: triggerCenterY - menuRect.height / 2,
                };
            case 'left':
                return {
                    x: triggerRect.left - menuRect.width - gap,
                    y: triggerCenterY - menuRect.height / 2,
                };
            case 'top':
                return {
                    x: triggerCenterX - menuRect.width / 2,
                    y: triggerRect.top - menuRect.height - gap,
                };
            case 'bottom':
            default:
                return {
                    x: triggerCenterX - menuRect.width / 2,
                    y: triggerRect.bottom + gap,
                };
        }
    };

    // 默认也严格使用 preferred（不回退），只做窗口 viewport clamp。
    const p = computePreferred(preferred);
    let x = p.x + offsetX;
    let y = p.y + offsetY;

    x = Math.min(Math.max(x, viewportRect.left + gap), viewportRect.right - menuRect.width - gap);
    y = Math.min(Math.max(y, viewportRect.top + gap), viewportRect.bottom - menuRect.height - gap);

    return { x, y, placement: preferred };
}

/**
 * 节流函数
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 泛型工具函数需接受任意参数类型
export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(
                () => {
                    lastCall = Date.now();
                    fn(...args);
                },
                delay - (now - lastCall)
            );
        }
    };
}

/**
 * 防抖函数
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 泛型工具函数需接受任意参数类型
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
