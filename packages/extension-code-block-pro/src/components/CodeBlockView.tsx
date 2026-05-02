import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { CodeBlockViewFull } from '@/components/CodeBlockViewFull';
import { CodeBlockViewLazy } from '@/components/CodeBlockViewLazy';
import { ConfigContextProvider, MermaidContextProvider, StateContextProvider } from '@/contexts';
import { useCodeBlockViewState } from '@/hooks/useCodeBlockViewState';
import type { CodeBlockViewProps } from '@/types';

export const CodeBlockView: React.FC<CodeBlockViewProps> = (props) => {
    const {
        configValue,
        stateValue,
        mermaidValue,
        wrapperClassName,
        dataLanguage,
        effectiveTheme,
        isLazyPending,
        lazyPlaceholderHeight,
        lazyPlaceholderLabel,
        lazyRef,
        wrapperRef,
    } = useCodeBlockViewState(props);

    return (
        <NodeViewWrapper ref={wrapperRef} className={wrapperClassName} data-language={dataLanguage}>
            <ConfigContextProvider value={configValue}>
                <StateContextProvider value={stateValue}>
                    <MermaidContextProvider value={mermaidValue}>
                        <CodeBlockViewFull
                            isLazyPending={isLazyPending}
                            lazyPlaceholder={
                                isLazyPending ? (
                                    <CodeBlockViewLazy
                                        theme={effectiveTheme}
                                        placeholderHeight={lazyPlaceholderHeight}
                                        label={lazyPlaceholderLabel}
                                        lazyRef={lazyRef}
                                    />
                                ) : null
                            }
                        />
                    </MermaidContextProvider>
                </StateContextProvider>
            </ConfigContextProvider>
        </NodeViewWrapper>
    );
};

CodeBlockView.displayName = 'CodeBlockView';
