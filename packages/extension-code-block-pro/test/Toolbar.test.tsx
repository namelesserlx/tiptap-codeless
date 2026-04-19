import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
    ConfigContextProvider,
    MermaidContextProvider,
    StateContextProvider,
    type ConfigContextValue,
    type MermaidContextValue,
    type StateContextValue,
} from '../src/contexts';
import { Toolbar } from '../src/components/Toolbar';

function createConfigValue(wrapperElement?: HTMLDivElement): ConfigContextValue {
    return {
        nodeAttrs: {
            language: 'javascript',
            showLineNumbers: true,
            showMermaidDiagram: false,
            collapsed: false,
            theme: 'auto',
        },
        options: {
            theme: 'auto',
            toolbar: {
                showLanguageSelector: true,
                showCopyButton: false,
                showLineNumbersToggle: true,
            },
            lineNumbers: {
                enabled: true,
                toggleable: true,
            },
            locale: 'en',
            messages: {
                toolbar: {
                    selectLanguage: 'Choose programming language',
                    showLineNumbers: 'Show line numbers',
                    hideLineNumbers: 'Hide line numbers',
                },
            },
            ui: {
                languageDropdown: {
                    zIndex: 2400,
                },
            },
        } as never,
        languages: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
        ],
        theme: 'auto',
        messages: {
            toolbar: {
                selectLanguage: 'Choose programming language',
                copyCode: 'Copy code',
                showLineNumbers: 'Show line numbers',
                hideLineNumbers: 'Hide line numbers',
                showDiagram: 'Show diagram',
                showCode: 'Show code',
            },
            controls: {
                close: 'Close',
                closeCodeBlock: 'Close code block',
                expand: 'Expand',
                collapse: 'Collapse',
                expandCodeBlock: 'Expand code block',
                collapseCodeBlock: 'Collapse code block',
                fullscreen: 'Fullscreen',
                exitFullscreen: 'Exit fullscreen',
                fullscreenCodeBlock: 'Show code block in fullscreen',
                exitFullscreenCodeBlock: 'Exit fullscreen mode',
            },
            expandButton: {
                expandDiagram: 'Expand diagram',
                expandAll: 'Expand all',
                expandAllWithCount: 'Expand all ({count} lines)',
            },
            lazyRender: {
                codeBlock: 'Code block',
                codeBlockWithLanguage: '{language} code block',
            },
            mermaid: {
                empty: 'The block is empty. Enter Mermaid source to render a diagram.',
                renderErrorTitle: 'Mermaid render error',
            },
        },
        updateAttributes: vi.fn(),
        deleteNode: vi.fn(),
        getPos: vi.fn(() => 1),
        contentRef: { current: null },
        wrapperRef: { current: wrapperElement ?? null },
        bodyRef: { current: null },
        diagramFromHeightRef: { current: 0 },
        getBodyHeight: vi.fn(() => 120),
        getCodeContent: vi.fn(() => 'const demo = true;'),
        currentLanguage: { value: 'javascript', label: 'JavaScript' },
        changeLanguage: vi.fn(),
    };
}

const stateValue: StateContextValue = {
    isCollapsed: false,
    collapsedLines: 3,
    isCollapsible: true,
    toggleCollapse: vi.fn(),
    showLineNumbers: true,
    toggleLineNumbers: vi.fn(),
    isFullscreen: false,
    handleFullscreen: vi.fn(),
};

const mermaidValue: MermaidContextValue = {
    isMermaid: false,
    isShowingMermaidDiagram: false,
};

describe('Toolbar', () => {
    it('renders translated labels, applies the configured dropdown z-index, and elevates the wrapper while open', () => {
        const wrapperElement = document.createElement('div');
        wrapperElement.className = 'code-block-pro-wrapper';
        const configValue = createConfigValue(wrapperElement);
        const { container } = render(
            <ConfigContextProvider value={configValue}>
                <StateContextProvider value={stateValue}>
                    <MermaidContextProvider value={mermaidValue}>
                        <Toolbar />
                    </MermaidContextProvider>
                </StateContextProvider>
            </ConfigContextProvider>
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Choose programming language',
            })
        );

        expect(
            screen.getByRole('button', {
                name: 'Hide line numbers',
            })
        ).toBeInTheDocument();
        expect(container.querySelector('.language-dropdown')).toHaveStyle({
            zIndex: '2400',
        });
        expect(wrapperElement.classList.contains('is-language-dropdown-open')).toBe(true);

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Choose programming language',
            })
        );

        expect(wrapperElement.classList.contains('is-language-dropdown-open')).toBe(false);
    });
});
