import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const baseCss = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');

describe('CodeBlock Pro styles', () => {
    it('uses one shared monospace stack for the wrapper and code content', () => {
        expect(baseCss).toMatch(/\.code-block-pro-wrapper\s*\{[\s\S]*?font-family:\s*var\(/);
        expect(baseCss).toMatch(/\.code-content pre\s*\{[\s\S]*?font-family:\s*var\(/);
        expect(baseCss).toMatch(
            /\.code-block-pro-wrapper\s+\.code-content\s+pre\s+code\s*\{[\s\S]*?font-family:\s*var\(/
        );
    });
});
