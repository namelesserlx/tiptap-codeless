import * as core from '../src/index';
import { describe, expect, it } from 'vitest';

describe('core i18n helpers', () => {
    it('normalizes supported locales to the shared locale contract', () => {
        const resolveLocale = (core as Record<string, unknown>).resolveLocale as
            | ((locale?: string | null) => string)
            | undefined;

        expect(resolveLocale?.('zh-HK')).toBe('zh-TW');
        expect(resolveLocale?.('zh_CN')).toBe('zh-CN');
        expect(resolveLocale?.('en-US')).toBe('en');
        expect(resolveLocale?.('ja-JP')).toBe('ja');
    });

    it('deep merges extension message overrides without losing defaults', () => {
        const mergeMessages = (core as Record<string, unknown>).mergeLocalizedMessages as
            | ((base: Record<string, unknown>, overrides?: Record<string, unknown>) => unknown)
            | undefined;

        const merged = mergeMessages?.(
            {
                toolbar: {
                    copy: 'Copy',
                    language: 'Language',
                },
                file: {
                    download: 'Download file',
                },
            },
            {
                toolbar: {
                    copy: 'Copy code',
                },
            }
        ) as
            | {
                  toolbar?: { copy?: string; language?: string };
                  file?: { download?: string };
              }
            | undefined;

        expect(merged).toEqual({
            toolbar: {
                copy: 'Copy code',
                language: 'Language',
            },
            file: {
                download: 'Download file',
            },
        });
    });
});
