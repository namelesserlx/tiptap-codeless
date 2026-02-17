/**
 * 代码块核心逻辑 Hook
 */

import { extractTextFromElement } from '@tiptap-codeless/core';
import { useCallback, useMemo, useRef } from 'react';
import type { LanguageConfig } from '@/types';

export interface UseCodeBlockOptions {
    /**
     * 当前语言
     */
    language?: string | null;

    /**
     * 支持的语言列表
     */
    languages?: LanguageConfig[];

    /**
     * 语言变化回调
     */
    onLanguageChange?: (language: string) => void;
}

/**
 * 代码块核心逻辑 Hook
 */
export function useCodeBlock(options: UseCodeBlockOptions) {
    const { language, languages = [], onLanguageChange } = options;

    const contentRef = useRef<HTMLDivElement>(null);

    // 获取当前语言配置
    const currentLanguage = useMemo(() => {
        const lang = languages.find(
            (l) => l.value === language || l.aliases?.includes(language || '')
        );
        return lang || { value: '', label: 'Auto' };
    }, [language, languages]);

    // 获取代码内容
    const getCodeContent = useCallback((): string => {
        if (!contentRef.current) return '';

        // 尝试多种方式获取代码内容
        const selectors = [
            '[data-node-view-content]',
            '.code-content pre',
            '.code-content code',
            'pre code',
            'pre',
        ];

        const text = extractTextFromElement(contentRef.current, selectors);
        return text;
    }, []);

    // 更改语言
    const changeLanguage = useCallback(
        (newLanguage: string) => {
            onLanguageChange?.(newLanguage);
        },
        [onLanguageChange]
    );

    // 获取代码行数
    const getLineCount = useCallback((): number => {
        const content = getCodeContent();
        if (!content) return 0;
        return content.split('\n').length;
    }, [getCodeContent]);

    // 获取指定范围的代码行
    const getLines = useCallback(
        (start: number, end?: number): string[] => {
            const content = getCodeContent();
            if (!content) return [];

            const lines = content.split('\n');
            return lines.slice(start, end);
        },
        [getCodeContent]
    );

    return {
        contentRef,
        currentLanguage,
        getCodeContent,
        changeLanguage,
        getLineCount,
        getLines,
    };
}
