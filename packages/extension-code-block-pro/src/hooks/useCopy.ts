/**
 * 复制功能 Hook
 */

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@tiptap-codeless/core';
import type { CopyState } from '@/types';

/**
 * 复制功能 Hook
 * @param resetDelay 重置延迟时间（毫秒）
 */
export function useCopy(resetDelay = 2000) {
    const [copyState, setCopyState] = useState<CopyState>('idle');

    const copy = useCallback(
        async (text: string) => {
            if (copyState === 'copying') return;

            setCopyState('copying');

            try {
                const success = await copyToClipboard(text);

                if (success) {
                    setCopyState('success');
                } else {
                    setCopyState('error');
                }

                // 延迟后重置状态
                setTimeout(() => {
                    setCopyState('idle');
                }, resetDelay);
            } catch (error) {
                console.error('Copy failed:', error);
                setCopyState('error');

                setTimeout(() => {
                    setCopyState('idle');
                }, resetDelay);
            }
        },
        [copyState, resetDelay]
    );

    return {
        copyState,
        copy,
        isCopying: copyState === 'copying',
        isSuccess: copyState === 'success',
        isError: copyState === 'error',
    };
}
