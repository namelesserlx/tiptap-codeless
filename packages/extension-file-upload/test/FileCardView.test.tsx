import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileCardView } from '../src/components/FileCardView';

describe('FileCardView', () => {
    it('uses translated fallback labels from extension storage', () => {
        render(
            <FileCardView
                editor={
                    {
                        storage: {
                            fileUpload: {
                                messages: {
                                    unnamedFile: 'Untitled file',
                                    downloadFile: 'Download file',
                                },
                            },
                        },
                    } as never
                }
                node={
                    {
                        attrs: {
                            url: 'https://example.com/demo.pdf',
                            name: '',
                            mimeType: 'application/pdf',
                            size: 1024,
                        },
                    } as never
                }
                selected={false}
                decorations={[]}
                extension={null as never}
                getPos={vi.fn(() => 1)}
                deleteNode={vi.fn()}
                updateAttributes={vi.fn()}
                view={null as never}
                innerDecorations={null as never}
                HTMLAttributes={{}}
            />
        );

        expect(screen.getByText('Untitled file')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download file' })).toBeInTheDocument();
    });
});
