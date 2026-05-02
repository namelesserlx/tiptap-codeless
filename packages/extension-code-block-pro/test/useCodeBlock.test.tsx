import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCodeBlock } from '../src/hooks/useCodeBlock';

describe('useCodeBlock', () => {
    it('uses node content as the source of truth before any DOM content is mounted', () => {
        const onLanguageChange = vi.fn();
        const { result } = renderHook(() =>
            useCodeBlock({
                language: 'typescript',
                content: 'const answer = 42;\nconsole.log(answer);',
                languages: [{ value: 'typescript', label: 'TypeScript' }],
                onLanguageChange,
            })
        );

        expect(result.current.getCodeContent()).toBe('const answer = 42;\nconsole.log(answer);');
        expect(result.current.getLineCount()).toBe(2);

        result.current.changeLanguage('typescript');
        expect(onLanguageChange).toHaveBeenCalledWith('typescript');
    });
});
