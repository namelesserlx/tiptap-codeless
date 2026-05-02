import * as fileUpload from '../src/index';
import { describe, expect, it } from 'vitest';

describe('FileUpload option normalization', () => {
    it('normalizes the 1.0 storage, picker, ingest, and ui contracts', () => {
        const normalizeFileUploadOptions = (fileUpload as Record<string, unknown>)
            .normalizeFileUploadOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  storage?: {
                      mode?: string;
                      alwaysAskDirectory?: boolean;
                  };
                  picker?: {
                      multiple?: boolean;
                  };
                  ingest?: {
                      allowedMimeTypes?: string[];
                      maxFileSize?: number;
                  };
                  ui?: {
                      bubbleMenu?: {
                          enabled?: boolean;
                          zIndex?: number;
                      };
                      uploadPlaceholder?: {
                          enabled?: boolean;
                      };
                  };
              })
            | undefined;

        const normalized = normalizeFileUploadOptions?.({
            storage: {
                mode: 'local',
                alwaysAskDirectory: false,
            },
            picker: {
                multiple: false,
            },
            ingest: {
                allowedMimeTypes: ['image/png'],
                maxFileSize: 1024,
            },
            ui: {
                bubbleMenu: {
                    enabled: false,
                    zIndex: 2048,
                },
                uploadPlaceholder: {
                    enabled: false,
                },
            },
        });

        expect(normalized?.storage).toEqual({
            mode: 'local',
            upload: undefined,
            directoryHandle: undefined,
            fileName: undefined,
            alwaysAskDirectory: false,
        });
        expect(normalized?.picker).toEqual({
            accept: undefined,
            multiple: false,
        });
        expect(normalized?.ingest).toEqual({
            paste: true,
            drop: true,
            allowedMimeTypes: ['image/png'],
            maxFileSize: 1024,
        });
        expect(normalized?.ui?.bubbleMenu).toEqual({
            enabled: false,
            zIndex: 2048,
        });
        expect(normalized?.ui?.uploadPlaceholder).toEqual({
            enabled: false,
        });
    });

    it('ignores removed 0.x top-level config fields instead of aliasing them', () => {
        const normalizeFileUploadOptions = (fileUpload as Record<string, unknown>)
            .normalizeFileUploadOptions as
            | ((
                  options?: Record<string, unknown>
              ) => {
                  storage?: {
                      mode?: string;
                      alwaysAskDirectory?: boolean;
                  };
                  picker?: {
                      accept?: string;
                      multiple?: boolean;
                  };
                  ingest?: {
                      paste?: boolean;
                      drop?: boolean;
                      allowedMimeTypes?: string[];
                      maxFileSize?: number;
                  };
                  ui?: {
                      bubbleMenu?: {
                          enabled?: boolean;
                          zIndex?: number;
                      };
                      uploadPlaceholder?: {
                          enabled?: boolean;
                      };
                  };
              })
            | undefined;

        const normalized = normalizeFileUploadOptions?.({
            storageMode: 'local',
            localStorageOptions: {
                alwaysAskDirectory: true,
            },
            upload: async () => ({ assets: [] }),
            accept: 'image/*',
            multiple: false,
            handlePaste: false,
            handleDrop: false,
            allowedMimeTypes: ['image/png'],
            maxFileSize: 256,
            imgBubbleMenuConfig: {
                enabled: false,
                zIndex: 4096,
            },
        });

        expect(normalized?.storage).toEqual({
            mode: 'memory',
            upload: undefined,
            directoryHandle: undefined,
            fileName: undefined,
            alwaysAskDirectory: false,
        });
        expect(normalized?.picker).toEqual({
            accept: undefined,
            multiple: true,
        });
        expect(normalized?.ingest).toEqual({
            paste: true,
            drop: true,
            allowedMimeTypes: undefined,
            maxFileSize: undefined,
        });
        expect(normalized?.ui?.bubbleMenu).toEqual({
            enabled: true,
            zIndex: 1000,
        });
        expect(normalized?.ui?.uploadPlaceholder).toEqual({
            enabled: true,
        });
    });
});
