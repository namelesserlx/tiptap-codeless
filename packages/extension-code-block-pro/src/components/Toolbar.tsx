/**
 * 工具栏组件
 */

import {
    ChevronDownIcon,
    CodeIcon,
    CopyIcon,
    CopySuccessIcon,
    LineNumbersIcon,
    MermaidDiagramIcon,
} from '@/components/icons/ToolbarIcons';
import { useConfigContext, useMermaidContext, useStateContext } from '@/contexts';
import { useCopy } from '@/hooks/useCopy';
import { useClickOutside } from '@tiptap-codeless/core';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

export interface ToolbarProps {
    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * 工具栏组件
 */
export const Toolbar: React.FC<ToolbarProps> = React.memo(({ className }) => {
    const {
        options,
        messages,
        isEditable,
        showMermaidDiagram,
        toggleMermaidDiagram,
        currentLanguage,
        languages,
        changeLanguage,
        getCodeContent,
        wrapperRef,
    } = useConfigContext();

    const { showLineNumbers, toggleLineNumbers } = useStateContext();

    const { isMermaid } = useMermaidContext();

    // 复制逻辑（仅在此组件使用）
    const { copyState, copy } = useCopy();

    // 处理复制（仅在此组件使用）
    const handleCopy = useCallback(() => {
        const content = getCodeContent();
        if (content) {
            copy(content);
        }
    }, [getCodeContent, copy]);

    const {
        language: showLanguageSelector = true,
        copy: showCopyButton = true,
        lineNumbers: showLineNumbersToggle = true,
    } = options.toolbar || {};

    const showMermaidToggle = isMermaid;
    const showLineNumbersToggleButton = showLineNumbersToggle && options.lineNumbers?.allowToggle;
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const isLanguageDropdownVisible = isEditable && isLanguageDropdownOpen;
    const dropdownZIndex = options.ui?.layers?.languageDropdown ?? 1000;

    // 点击外部关闭下拉菜单
    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsLanguageDropdownOpen(false);
    }, isLanguageDropdownVisible);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        wrapper.classList.toggle('is-language-dropdown-open', isLanguageDropdownVisible);

        return () => {
            wrapper.classList.remove('is-language-dropdown-open');
        };
    }, [isLanguageDropdownVisible, wrapperRef]);

    // 处理语言选择
    const handleLanguageSelect = (language: string) => {
        changeLanguage(language);
        setIsLanguageDropdownOpen(false);
    };

    return (
        <div className={classNames('code-block-toolbar', className)}>
            {/* 语言选择器 */}
            {showLanguageSelector && (
                <div className="language-selector" ref={dropdownRef}>
                    <button
                        type="button"
                        className="language-button"
                        onClick={() => {
                            if (isEditable) setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                        }}
                        disabled={!isEditable}
                        aria-label={messages.toolbar.selectLanguage}
                        aria-expanded={isLanguageDropdownVisible}
                    >
                        <span className="language-label">{currentLanguage.label}</span>
                        <ChevronDownIcon
                            className={classNames('arrow-icon', {
                                'is-open': isLanguageDropdownOpen,
                            })}
                            isOpen={isLanguageDropdownOpen}
                        />
                    </button>

                    {isLanguageDropdownVisible && (
                        <div className="language-dropdown" style={{ zIndex: dropdownZIndex }}>
                            <div className="language-list">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        type="button"
                                        className={classNames('language-option', {
                                            active: currentLanguage.value === lang.value,
                                        })}
                                        onClick={() => handleLanguageSelect(lang.value)}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 行号切换按钮 */}
            {showLineNumbersToggleButton && (
                <button
                    type="button"
                    className={classNames('toolbar-button line-numbers-toggle', {
                        active: showLineNumbers,
                    })}
                    onClick={toggleLineNumbers}
                    title={
                        showLineNumbers
                            ? messages.toolbar.hideLineNumbers
                            : messages.toolbar.showLineNumbers
                    }
                    aria-label={
                        showLineNumbers
                            ? messages.toolbar.hideLineNumbers
                            : messages.toolbar.showLineNumbers
                    }
                >
                    <LineNumbersIcon />
                </button>
            )}

            {/* Mermaid 图表切换按钮 */}
            {showMermaidToggle && (
                <button
                    type="button"
                    className={classNames('toolbar-button mermaid-toggle', {
                        active: showMermaidDiagram,
                    })}
                    onClick={toggleMermaidDiagram}
                    title={
                        showMermaidDiagram ? messages.toolbar.showCode : messages.toolbar.showDiagram
                    }
                    aria-label={
                        showMermaidDiagram ? messages.toolbar.showCode : messages.toolbar.showDiagram
                    }
                >
                    {showMermaidDiagram ? <CodeIcon /> : <MermaidDiagramIcon />}
                </button>
            )}

            {/* 复制按钮 */}
            {showCopyButton && (
                <button
                    type="button"
                    className={classNames('toolbar-button copy-button', {
                        success: copyState === 'success',
                        error: copyState === 'error',
                    })}
                    onClick={handleCopy}
                    disabled={copyState === 'copying'}
                    title={messages.toolbar.copyCode}
                    aria-label={messages.toolbar.copyCode}
                >
                    {copyState === 'success' ? <CopySuccessIcon /> : <CopyIcon />}
                </button>
            )}
        </div>
    );
});

Toolbar.displayName = 'Toolbar';
