import { NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import React, { useCallback, useMemo, useRef } from 'react';

import { ConfigContextProvider, MermaidContextProvider, StateContextProvider } from '@/contexts';
import { useCodeBlock, useCollapse, useFullscreen, useLineNumbers } from '@/hooks';
import type { CodeBlockViewProps, LanguageConfig } from '@/types';
import { CodeBlockBody } from '@/components/CodeBlockBody';
import { ExpandButton } from '@/components/ExpandButton';
import { MacOSControls } from '@/components/MacOSControls';
import { Toolbar } from '@/components/Toolbar';

export const CodeBlockViewFull: React.FC<CodeBlockViewProps> = ({
    node,
    updateAttributes,
    selected,
    extension,
    deleteNode,
    getPos,
}) => {
    const nodeAttrs = node.attrs;
    const { language, collapsed, showLineNumbers: showLineNumbersAttr, theme } = nodeAttrs;

    const options = extension.options;

    const languages: LanguageConfig[] = useMemo(() => options.languages || [], [options.languages]);

    const effectiveTheme = theme || options.theme || 'auto';

    const handleLanguageChange = useCallback(
        (newLanguage: string) => {
            updateAttributes({ language: newLanguage });
        },
        [updateAttributes]
    );

    const handleCollapsedChange = useCallback(
        (newCollapsed: boolean) => {
            updateAttributes({ collapsed: newCollapsed });
        },
        [updateAttributes]
    );

    const handleLineNumbersToggle = useCallback(
        (show: boolean) => {
            updateAttributes({ showLineNumbers: show });
        },
        [updateAttributes]
    );

    const { contentRef, currentLanguage, changeLanguage, getCodeContent } = useCodeBlock({
        language,
        languages,
        onLanguageChange: handleLanguageChange,
    });

    const {
        isCollapsed,
        collapsedLines,
        toggle: toggleCollapse,
    } = useCollapse({
        defaultCollapsed: collapsed,
        collapsedLines: options.collapse?.collapsedLines ?? 5,
        onCollapsedChange: handleCollapsedChange,
    });

    const { showLineNumbers, toggleLineNumbers } = useLineNumbers({
        showLineNumbersAttr,
        lineNumbersConfig: options.lineNumbers,
        onToggle: handleLineNumbersToggle,
    });

    const { isFullscreen, wrapperRef, handleFullscreen } = useFullscreen({
        macosControls: options.macosControls,
        node,
        getPos,
    });

    const isMermaid = currentLanguage.value === 'mermaid';
    const isCollapsible = options.collapse?.enabled ?? false;
    const showMermaidDiagram = node.attrs.showMermaidDiagram ?? false;
    const isShowingMermaidDiagram = isMermaid && showMermaidDiagram;

    const bodyRef = useRef<HTMLDivElement>(null);
    const diagramFromHeightRef = useRef(0);
    const getBodyHeight = useCallback(() => bodyRef.current?.offsetHeight ?? 0, []);

    const configValue = useMemo(
        () => ({
            nodeAttrs,
            options,
            languages,
            theme: effectiveTheme,
            updateAttributes,
            deleteNode,
            getPos,
            contentRef,
            wrapperRef,
            bodyRef,
            diagramFromHeightRef,
            getBodyHeight,
            getCodeContent,
            currentLanguage,
            changeLanguage,
        }),
        [
            nodeAttrs,
            options,
            languages,
            effectiveTheme,
            updateAttributes,
            deleteNode,
            getPos,
            contentRef,
            wrapperRef,
            bodyRef,
            diagramFromHeightRef,
            getBodyHeight,
            getCodeContent,
            currentLanguage,
            changeLanguage,
        ]
    );

    const stateValue = useMemo(
        () => ({
            isCollapsed,
            collapsedLines,
            isCollapsible,
            toggleCollapse,
            showLineNumbers,
            toggleLineNumbers,
            isFullscreen,
            handleFullscreen,
        }),
        [
            isCollapsed,
            collapsedLines,
            isCollapsible,
            toggleCollapse,
            showLineNumbers,
            toggleLineNumbers,
            isFullscreen,
            handleFullscreen,
        ]
    );

    const mermaidValue = useMemo(
        () => ({
            isMermaid,
            isShowingMermaidDiagram,
        }),
        [isMermaid, isShowingMermaidDiagram]
    );

    return (
        <NodeViewWrapper
            ref={wrapperRef}
            className={classNames(
                'code-block-pro-wrapper',
                `theme-${effectiveTheme}`,
                options.className,
                {
                    'is-selected': selected,
                    'is-collapsed': isCollapsed,
                    'is-fullscreen': isFullscreen,
                    'show-line-numbers': showLineNumbers,
                }
            )}
            data-language={language}
        >
            <ConfigContextProvider value={configValue}>
                <StateContextProvider value={stateValue}>
                    <MermaidContextProvider value={mermaidValue}>
                        <div className="code-block-pro-container">
                            <div className="code-block-header" contentEditable={false}>
                                <MacOSControls />
                                <Toolbar />
                            </div>
                            <div className="code-block-body" ref={bodyRef}>
                                <CodeBlockBody />
                            </div>
                            <ExpandButton />
                        </div>
                    </MermaidContextProvider>
                </StateContextProvider>
            </ConfigContextProvider>
        </NodeViewWrapper>
    );
};

CodeBlockViewFull.displayName = 'CodeBlockViewFull';
