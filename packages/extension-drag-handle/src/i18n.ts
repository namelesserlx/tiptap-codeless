import {
    resolveLocalizedMessages,
    type DeepPartial,
    type SupportedLocale,
} from '@tiptap-codeless/core';

export interface DragHandleMessages {
    insertMenu: {
        groups: {
            basic: string;
            common: string;
        };
        items: {
            heading1: string;
            heading2: string;
            heading3: string;
            bulletList: string;
            orderedList: string;
            paragraph: string;
            blockquote: string;
            codeBlock: string;
            horizontalRule: string;
        };
        empty: string;
    };
}

const dragHandleDictionaries: Record<SupportedLocale, DragHandleMessages> = {
    'zh-CN': {
        insertMenu: {
            groups: {
                basic: '基础',
                common: '常用',
            },
            items: {
                heading1: '标题 1',
                heading2: '标题 2',
                heading3: '标题 3',
                bulletList: '无序列表',
                orderedList: '有序列表',
                paragraph: '段落',
                blockquote: '引用',
                codeBlock: '代码块',
                horizontalRule: '分割线',
            },
            empty: '无匹配结果',
        },
    },
    'zh-TW': {
        insertMenu: {
            groups: {
                basic: '基礎',
                common: '常用',
            },
            items: {
                heading1: '標題 1',
                heading2: '標題 2',
                heading3: '標題 3',
                bulletList: '無序清單',
                orderedList: '有序清單',
                paragraph: '段落',
                blockquote: '引用',
                codeBlock: '程式碼區塊',
                horizontalRule: '分隔線',
            },
            empty: '沒有符合的結果',
        },
    },
    en: {
        insertMenu: {
            groups: {
                basic: 'Basic',
                common: 'Common',
            },
            items: {
                heading1: 'Heading 1',
                heading2: 'Heading 2',
                heading3: 'Heading 3',
                bulletList: 'Bulleted list',
                orderedList: 'Numbered list',
                paragraph: 'Paragraph',
                blockquote: 'Quote',
                codeBlock: 'Code block',
                horizontalRule: 'Divider',
            },
            empty: 'No matching items',
        },
    },
    ja: {
        insertMenu: {
            groups: {
                basic: '基本',
                common: 'よく使う項目',
            },
            items: {
                heading1: '見出し 1',
                heading2: '見出し 2',
                heading3: '見出し 3',
                bulletList: '箇条書き',
                orderedList: '番号付きリスト',
                paragraph: '段落',
                blockquote: '引用',
                codeBlock: 'コードブロック',
                horizontalRule: '区切り線',
            },
            empty: '一致する項目がありません',
        },
    },
};

export function resolveDragHandleMessages(
    locale?: string | null,
    overrides?: DeepPartial<DragHandleMessages>
): DragHandleMessages {
    return resolveLocalizedMessages(dragHandleDictionaries, locale, overrides);
}
