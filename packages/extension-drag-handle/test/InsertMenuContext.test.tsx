import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DragHandleProvider } from '../src/contexts/DragHandleContext';
import { InsertMenuProvider, useInsertMenuContext } from '../src/contexts/InsertMenuContext';

function MenuSnapshot() {
    const { items } = useInsertMenuContext();

    return (
        <div>
            {items.map((item) =>
                'items' in item ? (
                    <section key={item.id}>
                        <h2>{item.title}</h2>
                        {item.items.map((child) => (
                            <span key={child.id}>{child.label}</span>
                        ))}
                    </section>
                ) : (
                    <span key={item.id}>{item.label}</span>
                )
            )}
        </div>
    );
}

describe('InsertMenuProvider', () => {
    it('localizes the built-in menu groups and items through the shared messages contract', () => {
        const editor = {
            on: vi.fn(),
            off: vi.fn(),
            view: {
                dispatch: vi.fn(),
                state: {
                    tr: {
                        setMeta: vi.fn(() => ({})),
                    },
                },
            },
        } as never;

        render(
            <DragHandleProvider
                editor={editor}
                options={
                    {
                        locale: 'en',
                        messages: {
                            insertMenu: {
                                groups: {
                                    basic: 'Basic',
                                    common: 'Common',
                                },
                                items: {
                                    heading1: 'Heading 1',
                                    paragraph: 'Paragraph',
                                    codeBlock: 'Code block',
                                },
                            },
                        },
                    } as never
                }
                pluginState={{
                    locked: false,
                    currentNode: null,
                    isDragging: false,
                    isVisible: false,
                    insertMenuCommandRange: null,
                }}
            >
                <InsertMenuProvider>
                    <MenuSnapshot />
                </InsertMenuProvider>
            </DragHandleProvider>
        );

        expect(screen.getByText('Basic')).toBeInTheDocument();
        expect(screen.getByText('Heading 1')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
        expect(screen.getByText('Code block')).toBeInTheDocument();
    });
});
