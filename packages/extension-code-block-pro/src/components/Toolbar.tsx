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
import React, { useCallback, useState } from 'react';

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
        nodeAttrs,
        options,
        updateAttributes,
        currentLanguage,
        languages,
        changeLanguage,
        getCodeContent,
        getBodyHeight,
        diagramFromHeightRef,
    } = useConfigContext();

    const { showLineNumbers, toggleLineNumbers } = useStateContext();

    const { isMermaid } = useMermaidContext();

    // 复制逻辑（仅在此组件使用）
    const { copyState, copy } = useCopy();
    const showMermaidDiagram = nodeAttrs.showMermaidDiagram ?? false;

    // 处理复制（仅在此组件使用）
    const handleCopy = useCallback(() => {
        const content = getCodeContent();
        if (content) {
            copy(content);
        }
    }, [getCodeContent, copy]);

    // 处理 Mermaid 图表切换：切到图表前写入当前 body 高度，图表从该高度平滑展开
    const toggleMermaidDiagram = useCallback(() => {
        const newValue = !showMermaidDiagram;
        if (newValue) diagramFromHeightRef.current = getBodyHeight();
        updateAttributes({ showMermaidDiagram: newValue });
    }, [showMermaidDiagram, updateAttributes, getBodyHeight, diagramFromHeightRef]);

    const {
        showLanguageSelector = true,
        showCopyButton = true,
        showLineNumbersToggle = true,
    } = options.toolbar || {};

    const showMermaidToggle = isMermaid;
    const showLineNumbersToggleButton = showLineNumbersToggle && options.lineNumbers?.toggleable;
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    // 点击外部关闭下拉菜单
    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsLanguageDropdownOpen(false);
    }, isLanguageDropdownOpen);

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
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        aria-label="选择编程语言"
                        aria-expanded={isLanguageDropdownOpen}
                    >
                        <span className="language-label">{currentLanguage.label}</span>
                        <ChevronDownIcon
                            className={classNames('arrow-icon', {
                                'is-open': isLanguageDropdownOpen,
                            })}
                            isOpen={isLanguageDropdownOpen}
                        />
                    </button>

                    {isLanguageDropdownOpen && (
                        <div className="language-dropdown">
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
                    title={showLineNumbers ? '隐藏行号' : '显示行号'}
                    aria-label={showLineNumbers ? '隐藏行号' : '显示行号'}
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
                    title={showMermaidDiagram ? '显示代码' : '显示图表'}
                    aria-label={showMermaidDiagram ? '显示代码' : '显示图表'}
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
                    title="复制代码"
                    aria-label="复制代码"
                >
                    {copyState === 'success' ? <CopySuccessIcon /> : <CopyIcon />}
                </button>
            )}
        </div>
    );
});

Toolbar.displayName = 'Toolbar';
