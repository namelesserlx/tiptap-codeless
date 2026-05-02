import * as codeBlockPro from '../src/index';
import { describe, expect, it } from 'vitest';

describe('CodeBlockPro option normalization', () => {
    it('normalizes the 1.0 toolbar, collapse, rendering, and layer contracts', () => {
        const normalizeCodeBlockProOptions = (codeBlockPro as Record<string, unknown>)
            .normalizeCodeBlockProOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  windowControls?: {
                      close?: boolean;
                      collapse?: boolean;
                      fullscreen?: boolean;
                  };
                  toolbar?: {
                      language?: boolean;
                      copy?: boolean;
                      lineNumbers?: boolean;
                  };
                  lineNumbers?: {
                      enabled?: boolean;
                      start?: number;
                      allowToggle?: boolean;
                  };
                  collapse?: {
                      enabled?: boolean;
                      defaultCollapsed?: boolean;
                      visibleLines?: number;
                  };
                  rendering?: {
                      lazy?: boolean;
                      rootMargin?: string;
                      placeholderHeight?: number;
                  };
                  ui?: {
                      layers?: {
                          languageDropdown?: number;
                      };
                  };
              })
            | undefined;

        const normalized = normalizeCodeBlockProOptions?.({
            windowControls: {
                fullscreen: false,
            },
            toolbar: {
                copy: false,
            },
            lineNumbers: {
                start: 4,
            },
            collapse: {
                visibleLines: 6,
            },
            rendering: {
                placeholderHeight: 160,
            },
            ui: {
                layers: {
                    languageDropdown: 2600,
                },
            },
        });

        expect(normalized?.windowControls).toEqual({
            close: true,
            collapse: true,
            fullscreen: false,
        });
        expect(normalized?.toolbar).toEqual({
            language: true,
            copy: false,
            lineNumbers: true,
        });
        expect(normalized?.lineNumbers).toEqual({
            enabled: true,
            start: 4,
            allowToggle: true,
        });
        expect(normalized?.ui?.layers).toEqual({
            languageDropdown: 2600,
        });
        expect(normalized?.collapse).toEqual({
            enabled: true,
            defaultCollapsed: false,
            visibleLines: 6,
        });
        expect(normalized?.rendering).toEqual({
            lazy: false,
            rootMargin: '100px',
            placeholderHeight: 160,
        });
    });
});
