/**
 * 点击外部 Hook
 */

import { useEffect, useRef } from 'react';

/**
 * 点击外部 Hook
 * @param handler 点击外部时的回调函数
 * @param enabled 是否启用（默认为 true）
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    handler: (event: MouseEvent | TouchEvent) => void,
    enabled = true
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            // 检查点击是否在元素外部
            if (ref.current && !ref.current.contains(target)) {
                handler(event);
            }
        };

        // 延迟添加监听器，避免立即触发
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
}
