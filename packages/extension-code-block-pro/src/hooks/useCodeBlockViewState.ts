import classNames from 'classnames';
import type { RefObject } from 'react';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { MermaidContextValue } from '@/contexts/MermaidContext';
import type { StateContextValue } from '@/contexts/StateContext';
import type { ConfigContextValue } from '@/contexts/ConfigContext';
import { normalizeCodeBlockProOptions } from '@/config/normalizeOptions';
import { useCodeBlock } from '@/hooks/useCodeBlock';
import { useCollapse } from '@/hooks/useCollapse';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useLazyRender } from '@/hooks/useLazyRender';
import { useLineNumbers } from '@/hooks/useLineNumbers';
import { formatCodeBlockProMessage, resolveCodeBlockProMessages } from '@/i18n';
import type { CodeBlockViewProps, LanguageConfig } from '@/types';

export interface CodeBlockViewState {
    configValue: ConfigContextValue;
    stateValue: StateContextValue;
    mermaidValue: MermaidContextValue;
    wrapperClassName: string;
    dataLanguage?: string | null;
    effectiveTheme: string;
    isLazyPending: boolean;
    lazyPlaceholderHeight: number;
    lazyPlaceholderLabel: string;
    lazyRef: RefObject<HTMLDivElement | null>;
    wrapperRef: RefObject<HTMLDivElement | null>;
}

export function useCodeBlockViewState({
    node,
    updateAttributes,
    selected,
    extension,
    editor,
    deleteNode,
    getPos,
}: CodeBlockViewProps): CodeBlockViewState {
    const nodeAttrs = node.attrs;
    const { language, collapsed, showLineNumbers: showLineNumbersAttr, theme } = nodeAttrs;

    const options = useMemo(
        () => normalizeCodeBlockProOptions(extension.options),
        [extension.options]
    );

    const languages: LanguageConfig[] = useMemo(() => options.languages || [], [options.languages]);
    const effectiveTheme = theme || options.theme || 'auto';
    const messages = useMemo(
        () => resolveCodeBlockProMessages(options.locale, options.messages),
        [options.locale, options.messages]
    );
    const isEditable = useSyncExternalStore(
        (callback) => {
            if (!editor || typeof editor.on !== 'function') {
                return () => {};
            }
            editor.on('update', callback);
            return () => {
                editor.off('update', callback);
            };
        },
        () => editor?.isEditable ?? true
    );
    const showMermaidDiagramAttr = node.attrs.showMermaidDiagram ?? false;
    const [mermaidDiagramState, setMermaidDiagramState] = useState(() => ({
        source: showMermaidDiagramAttr,
        value: showMermaidDiagramAttr,
    }));
    const showMermaidDiagram =
        mermaidDiagramState.source === showMermaidDiagramAttr
            ? mermaidDiagramState.value
            : showMermaidDiagramAttr;

    const handleLanguageChange = useCallback(
        (newLanguage: string) => {
            if (!isEditable) return;
            updateAttributes({ language: newLanguage });
        },
        [isEditable, updateAttributes]
    );

    const handleCollapsedChange = useCallback(
        (newCollapsed: boolean) => {
            if (!isEditable) return;
            updateAttributes({ collapsed: newCollapsed });
        },
        [isEditable, updateAttributes]
    );

    const handleLineNumbersToggle = useCallback(
        (show: boolean) => {
            if (!isEditable) return;
            updateAttributes({ showLineNumbers: show });
        },
        [isEditable, updateAttributes]
    );

    const handleUpdateAttributes = useCallback(
        (attrs: Parameters<CodeBlockViewProps['updateAttributes']>[0]) => {
            if (!isEditable) return;
            updateAttributes(attrs);
        },
        [isEditable, updateAttributes]
    );

    const handleDeleteNode = useMemo(
        () =>
            deleteNode
                ? () => {
                      if (!isEditable) return;
                      deleteNode();
                  }
                : undefined,
        [deleteNode, isEditable]
    );

    const bodyRef = useRef<HTMLDivElement>(null);
    const diagramFromHeightRef = useRef(0);
    const getBodyHeight = useCallback(() => bodyRef.current?.offsetHeight ?? 0, []);

    const toggleMermaidDiagram = useCallback(() => {
        setMermaidDiagramState((current) => {
            const currentValue =
                current.source === showMermaidDiagramAttr
                    ? current.value
                    : showMermaidDiagramAttr;
            const next = !currentValue;
            if (next) diagramFromHeightRef.current = getBodyHeight();
            if (isEditable) {
                updateAttributes({ showMermaidDiagram: next });
            }
            return {
                source: showMermaidDiagramAttr,
                value: next,
            };
        });
    }, [getBodyHeight, isEditable, showMermaidDiagramAttr, updateAttributes]);

    const { contentRef, currentLanguage, changeLanguage, getCodeContent } = useCodeBlock({
        language,
        languages,
        content: node.textContent,
        onLanguageChange: handleLanguageChange,
    });

    const {
        isCollapsed,
        collapsedLines,
        toggle: toggleCollapse,
    } = useCollapse({
        defaultCollapsed: collapsed,
        collapsedLines: options.collapse?.visibleLines ?? 5,
        onCollapsedChange: handleCollapsedChange,
    });

    const { showLineNumbers, toggleLineNumbers } = useLineNumbers({
        showLineNumbersAttr,
        lineNumbersConfig: options.lineNumbers,
        onToggle: handleLineNumbersToggle,
    });

    const { isFullscreen, wrapperRef, handleFullscreen } = useFullscreen({
        windowControls: options.windowControls,
        node,
        getPos,
    });

    const { ref: lazyRef, hasBeenVisible } = useLazyRender({
        enabled: options.rendering.lazy,
        rootMargin: options.rendering.rootMargin,
    });

    const isLazyPending = Boolean(options.rendering.lazy && !hasBeenVisible);
    const lazyPlaceholderHeight = options.rendering.placeholderHeight ?? 100;
    const lazyPlaceholderLabel = language
        ? formatCodeBlockProMessage(messages.lazyRender.codeBlockWithLanguage, {
              language,
          })
        : messages.lazyRender.codeBlock;

    const isMermaid = currentLanguage.value === 'mermaid';
    const isShowingMermaidDiagram = isMermaid && showMermaidDiagram && !isLazyPending;
    const isCollapsible = options.collapse?.enabled ?? false;

    const configValue: ConfigContextValue = {
        nodeAttrs,
        options,
        languages,
        theme: effectiveTheme,
        messages,
        updateAttributes: handleUpdateAttributes,
        isEditable,
        showMermaidDiagram,
        toggleMermaidDiagram,
        deleteNode: handleDeleteNode,
        getPos,
        contentRef,
        wrapperRef,
        bodyRef,
        diagramFromHeightRef,
        getBodyHeight,
        getCodeContent,
        currentLanguage,
        changeLanguage,
    };

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

    const wrapperClassName = classNames(
        'code-block-pro-wrapper',
        `theme-${effectiveTheme}`,
        typeof options.HTMLAttributes?.class === 'string' ? options.HTMLAttributes.class : null,
        {
            'is-selected': selected,
            'is-collapsed': isCollapsed,
            'is-fullscreen': isFullscreen,
            'show-line-numbers': showLineNumbers,
            'is-lazy-placeholder': isLazyPending,
        }
    );

    return {
        configValue,
        stateValue,
        mermaidValue,
        wrapperClassName,
        dataLanguage: language,
        effectiveTheme,
        isLazyPending,
        lazyPlaceholderHeight,
        lazyPlaceholderLabel,
        lazyRef,
        wrapperRef,
    };
}
