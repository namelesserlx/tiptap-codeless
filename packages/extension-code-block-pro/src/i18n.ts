import {
    formatLocalizedMessage,
    resolveLocalizedMessages,
    type DeepPartial,
    type SupportedLocale,
} from '@tiptap-codeless/core';

export interface CodeBlockProMessages {
    toolbar: {
        selectLanguage: string;
        copyCode: string;
        showLineNumbers: string;
        hideLineNumbers: string;
        showDiagram: string;
        showCode: string;
    };
    controls: {
        close: string;
        closeCodeBlock: string;
        expand: string;
        collapse: string;
        expandCodeBlock: string;
        collapseCodeBlock: string;
        fullscreen: string;
        exitFullscreen: string;
        fullscreenCodeBlock: string;
        exitFullscreenCodeBlock: string;
    };
    expandButton: {
        expandDiagram: string;
        expandAll: string;
        expandAllWithCount: string;
    };
    lazyRender: {
        codeBlock: string;
        codeBlockWithLanguage: string;
    };
    mermaid: {
        empty: string;
        renderErrorTitle: string;
    };
}

const codeBlockProDictionaries: Record<SupportedLocale, CodeBlockProMessages> = {
    'zh-CN': {
        toolbar: {
            selectLanguage: '选择编程语言',
            copyCode: '复制代码',
            showLineNumbers: '显示行号',
            hideLineNumbers: '隐藏行号',
            showDiagram: '显示图表',
            showCode: '显示代码',
        },
        controls: {
            close: '关闭',
            closeCodeBlock: '关闭代码块',
            expand: '展开',
            collapse: '折叠',
            expandCodeBlock: '展开代码块',
            collapseCodeBlock: '折叠代码块',
            fullscreen: '全屏',
            exitFullscreen: '退出全屏',
            fullscreenCodeBlock: '全屏显示代码块',
            exitFullscreenCodeBlock: '退出全屏模式',
        },
        expandButton: {
            expandDiagram: '展开图表',
            expandAll: '展开全部',
            expandAllWithCount: '展开全部 ({count} 行)',
        },
        lazyRender: {
            codeBlock: '代码块',
            codeBlockWithLanguage: '{language} 代码块',
        },
        mermaid: {
            empty: '代码为空，请输入 Mermaid 代码',
            renderErrorTitle: 'Mermaid 渲染错误',
        },
    },
    'zh-TW': {
        toolbar: {
            selectLanguage: '選擇程式語言',
            copyCode: '複製程式碼',
            showLineNumbers: '顯示行號',
            hideLineNumbers: '隱藏行號',
            showDiagram: '顯示圖表',
            showCode: '顯示程式碼',
        },
        controls: {
            close: '關閉',
            closeCodeBlock: '關閉程式碼區塊',
            expand: '展開',
            collapse: '折疊',
            expandCodeBlock: '展開程式碼區塊',
            collapseCodeBlock: '折疊程式碼區塊',
            fullscreen: '全螢幕',
            exitFullscreen: '退出全螢幕',
            fullscreenCodeBlock: '全螢幕顯示程式碼區塊',
            exitFullscreenCodeBlock: '退出全螢幕模式',
        },
        expandButton: {
            expandDiagram: '展開圖表',
            expandAll: '展開全部',
            expandAllWithCount: '展開全部（{count} 行）',
        },
        lazyRender: {
            codeBlock: '程式碼區塊',
            codeBlockWithLanguage: '{language} 程式碼區塊',
        },
        mermaid: {
            empty: '程式碼為空，請輸入 Mermaid 程式碼',
            renderErrorTitle: 'Mermaid 渲染錯誤',
        },
    },
    en: {
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
    ja: {
        toolbar: {
            selectLanguage: 'プログラミング言語を選択',
            copyCode: 'コードをコピー',
            showLineNumbers: '行番号を表示',
            hideLineNumbers: '行番号を非表示',
            showDiagram: '図を表示',
            showCode: 'コードを表示',
        },
        controls: {
            close: '閉じる',
            closeCodeBlock: 'コードブロックを閉じる',
            expand: '展開',
            collapse: '折りたたむ',
            expandCodeBlock: 'コードブロックを展開',
            collapseCodeBlock: 'コードブロックを折りたたむ',
            fullscreen: '全画面',
            exitFullscreen: '全画面を終了',
            fullscreenCodeBlock: 'コードブロックを全画面表示',
            exitFullscreenCodeBlock: '全画面モードを終了',
        },
        expandButton: {
            expandDiagram: '図を展開',
            expandAll: 'すべて展開',
            expandAllWithCount: 'すべて展開（{count} 行）',
        },
        lazyRender: {
            codeBlock: 'コードブロック',
            codeBlockWithLanguage: '{language} コードブロック',
        },
        mermaid: {
            empty: 'Mermaid コードを入力してください。',
            renderErrorTitle: 'Mermaid の描画エラー',
        },
    },
};

export function resolveCodeBlockProMessages(
    locale?: string | null,
    overrides?: DeepPartial<CodeBlockProMessages>
): CodeBlockProMessages {
    return resolveLocalizedMessages(codeBlockProDictionaries, locale, overrides);
}

export function formatCodeBlockProMessage(
    template: string,
    values?: Record<string, string | number | null | undefined>
): string {
    return formatLocalizedMessage(template, values);
}
