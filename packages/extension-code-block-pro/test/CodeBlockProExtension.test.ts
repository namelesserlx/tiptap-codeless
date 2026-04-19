import { describe, expect, it } from 'vitest';
import { CodeBlockPro } from '../src/extension/CodeBlockProExtension';

describe('CodeBlockPro options', () => {
    it('preserves the parent CodeBlockLowlight defaults when configured', () => {
        const extension = CodeBlockPro.configure({});

        expect(extension.options.languageClassPrefix).toBe('language-');
        expect(extension.options.exitOnTripleEnter).toBe(true);
        expect(extension.options.exitOnArrowDown).toBe(true);
        expect(extension.options.enableTabIndentation).toBe(false);
    });
});
