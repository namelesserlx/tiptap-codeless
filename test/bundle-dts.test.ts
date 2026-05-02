import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { afterEach, describe, expect, it } from 'vitest';
import { bundleDeclarations } from '../scripts/bundle-dts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(__dirname, 'fixtures/dts-bundle');
const outputRoots: string[] = [];

afterEach(async () => {
    await Promise.all(outputRoots.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('bundleDeclarations', () => {
    it(
        'emits a single bundled index.d.ts for an entry with internal modules and path aliases',
        async () => {
            const outputRoot = await mkdtemp(resolve(tmpdir(), 'tiptap-codeless-dts-'));
            outputRoots.push(outputRoot);

            const outputFile = resolve(outputRoot, 'index.d.ts');

            await bundleDeclarations({
                project: resolve(fixtureRoot, 'tsconfig.json'),
                entry: resolve(fixtureRoot, 'src/index.ts'),
                output: outputFile,
                appendDeclarations: [resolve(fixtureRoot, 'src/ambient.d.ts')],
            });

            const bundled = await readFile(outputFile, 'utf8');

            expect(bundled).toContain('interface ExampleOptions');
            expect(bundled).toContain('declare function createExample');
            expect(bundled).toContain("declare module 'example-editor'");
            expect(bundled).toContain('exampleCommand: (options?: ExampleOptions) => ReturnType;');
            expect(bundled).not.toContain("from '@/");
            expect(bundled).not.toContain("from './createExample'");
            expect(bundled).not.toContain("from './types'");
        },
        15000
    );
});
