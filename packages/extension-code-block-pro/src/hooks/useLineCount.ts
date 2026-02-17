/**
 * 行数计算 Hook
 * 从 contentRef 中自动计算代码行数，并监听内容变化
 */

import React, { useEffect, useState } from 'react';

/**
 * 计算行数的 Hook
 * @param contentRef 内容元素的 ref
 * @param defaultValue 默认行数（当无法计算时使用）
 * @returns 当前行数
 */
export function useLineCount(
    contentRef: React.RefObject<HTMLElement | null>,
    defaultValue: number = 1
): number {
    const [lineCount, setLineCount] = useState(defaultValue);

    useEffect(() => {
        const updateLineCount = () => {
            const element = contentRef.current;
            if (!element) {
                setLineCount(defaultValue);
                return;
            }

            // 通过 textContent 计算行数
            const codeElement = element.querySelector('code');
            if (codeElement) {
                const text = codeElement.textContent || '';
                const count = text ? text.split('\n').length : defaultValue;
                setLineCount(count);
                return;
            }

            setLineCount(defaultValue);
        };

        // 初始计算
        updateLineCount();

        // 使用 MutationObserver 监听内容变化
        const observer = new MutationObserver(updateLineCount);
        const element = contentRef.current;
        if (element) {
            observer.observe(element, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [contentRef, defaultValue]);

    return lineCount;
}
