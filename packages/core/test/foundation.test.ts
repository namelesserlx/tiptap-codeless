import * as core from '../src/index';
import { describe, expect, it } from 'vitest';

describe('core foundation helpers', () => {
    it('deep merges canonical ui config without dropping existing keys', () => {
        const mergeUiConfig = (core as Record<string, unknown>).mergeUiConfig as
            | ((...parts: Array<Record<string, unknown> | undefined>) => Record<string, unknown>)
            | undefined;

        const merged = mergeUiConfig?.(
            {
                bubbleMenu: {
                    enabled: true,
                    zIndex: 1000,
                },
                languageDropdown: {
                    zIndex: 1200,
                },
            },
            {
                bubbleMenu: {
                    zIndex: 2400,
                },
            }
        );

        expect(merged).toEqual({
            bubbleMenu: {
                enabled: true,
                zIndex: 2400,
            },
            languageDropdown: {
                zIndex: 1200,
            },
        });
    });

    it('allocates deterministic overlay layers from a shared manager', () => {
        const createLayerManager = (core as Record<string, unknown>).createLayerManager as
            | ((options?: { base?: number; step?: number }) => { get: (key: string) => number })
            | undefined;

        const manager = createLayerManager?.({
            base: 1000,
            step: 25,
        });

        expect(manager?.get('toolbar')).toBe(1000);
        expect(manager?.get('dropdown')).toBe(1025);
        expect(manager?.get('toolbar')).toBe(1000);
    });

    it('releases tracked resources when they leave the active set', () => {
        const released: string[] = [];
        const createObjectLifecycleRegistry = (core as Record<string, unknown>)
            .createObjectLifecycleRegistry as
            | ((
                  release: (key: string) => void
              ) => {
                  track: (key: string) => void;
                  releaseMissing: (active: Set<string>) => void;
                  releaseAll: () => void;
              })
            | undefined;

        const registry = createObjectLifecycleRegistry?.((key) => released.push(key));
        registry?.track('blob:a');
        registry?.track('blob:b');
        registry?.releaseMissing(new Set(['blob:b']));
        registry?.releaseAll();

        expect(released).toEqual(['blob:a', 'blob:b']);
    });

    it('creates a minimal editor harness with base document nodes by default', () => {
        const createTestEditor = (core as Record<string, unknown>).createTestEditor as
            | ((options?: { content?: string }) => { getHTML: () => string; destroy: () => void })
            | undefined;

        const editor = createTestEditor?.({
            content: '<p>foundation</p>',
        });

        expect(editor?.getHTML()).toBe('<p>foundation</p>');
        editor?.destroy();
    });
});
