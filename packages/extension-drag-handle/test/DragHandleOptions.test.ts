import * as dragHandle from '../src/index';
import { describe, expect, it } from 'vitest';

describe('DragHandle option normalization', () => {
    it('normalizes the 1.0 handle and insert menu contracts', () => {
        const normalizeDragHandleOptions = (dragHandle as Record<string, unknown>)
            .normalizeDragHandleOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  handle?: {
                      width?: number;
                      hideDelay?: number;
                      iconSize?: number;
                  };
                  insertMenu?: {
                      enabled?: boolean;
                      trigger?: string | RegExp | false;
                      strategy?: 'replace' | 'merge';
                      placement?: 'right' | 'left' | 'bottom' | 'top';
                      offset?: {
                          x?: number;
                          y?: number;
                      };
                      zIndex?: number;
                  };
              })
            | undefined;

        const normalized = normalizeDragHandleOptions?.({
            handle: {
                width: 30,
                hideDelay: 180,
                iconSize: 22,
            },
            insertMenu: {
                enabled: true,
                strategy: 'merge',
                placement: 'right',
                zIndex: 2400,
            },
        });

        expect(normalized?.handle).toEqual({
            width: 30,
            height: 24,
            hoverDelay: 0,
            hideDelay: 180,
            zIndex: 100,
            iconSize: 22,
            icons: {
                drag: undefined,
                insert: undefined,
            },
        });
        expect(normalized?.insertMenu).toEqual({
            enabled: true,
            trigger: '/',
            strategy: 'merge',
            placement: 'right',
            offset: {
                x: 0,
                y: 0,
            },
            zIndex: 2400,
            items: undefined,
            component: undefined,
        });
    });

    it('allows disabling slash-triggered opening without disabling the insert handle', () => {
        const normalizeDragHandleOptions = (dragHandle as Record<string, unknown>)
            .normalizeDragHandleOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  insertMenu?: {
                      enabled?: boolean;
                      trigger?: string | RegExp | false;
                  };
              })
            | undefined;

        const normalized = normalizeDragHandleOptions?.({
            insertMenu: {
                enabled: true,
                trigger: false,
            },
        });

        expect(normalized?.insertMenu).toEqual({
            enabled: true,
            trigger: false,
            strategy: 'replace',
            placement: 'left',
            offset: {
                x: 0,
                y: 0,
            },
            zIndex: 1000,
            items: undefined,
            component: undefined,
        });
    });

    it('preserves nested offset defaults when partially overriding the public config', () => {
        const normalizeDragHandleOptions = (dragHandle as Record<string, unknown>)
            .normalizeDragHandleOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  offset?: {
                      x?: number;
                      y?: number;
                  };
                  nodes?: {
                      include?: string[];
                      exclude?: string[];
                  };
                  insertMenu?: {
                      offset?: {
                          x?: number;
                          y?: number;
                      };
                  };
              })
            | undefined;

        const normalized = normalizeDragHandleOptions?.({
            offset: {
                x: -40,
            },
            nodes: {
                include: ['paragraph'],
            },
            insertMenu: {
                offset: {
                    x: 12,
                },
            },
        });

        expect(normalized?.offset).toEqual({
            x: -40,
            y: 0,
        });
        expect(normalized?.nodes).toEqual({
            include: ['paragraph'],
            exclude: [],
        });
        expect(normalized?.insertMenu).toMatchObject({
            placement: 'left',
            offset: {
                x: 12,
                y: 0,
            },
        });
    });
});
