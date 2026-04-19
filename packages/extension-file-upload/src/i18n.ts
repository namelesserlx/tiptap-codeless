import {
    resolveLocalizedMessages,
    type DeepPartial,
    type SupportedLocale,
} from '@tiptap-codeless/core';

export interface FileUploadMessages {
    fileCard: {
        unnamedFile: string;
        downloadFile: string;
    };
    bubbleMenu: {
        alignLeft: string;
        alignCenter: string;
        alignRight: string;
    };
}

const fileUploadDictionaries: Record<SupportedLocale, FileUploadMessages> = {
    'zh-CN': {
        fileCard: {
            unnamedFile: '未命名文件',
            downloadFile: '下载文件',
        },
        bubbleMenu: {
            alignLeft: '左对齐',
            alignCenter: '居中',
            alignRight: '右对齐',
        },
    },
    'zh-TW': {
        fileCard: {
            unnamedFile: '未命名檔案',
            downloadFile: '下載檔案',
        },
        bubbleMenu: {
            alignLeft: '靠左對齊',
            alignCenter: '置中',
            alignRight: '靠右對齊',
        },
    },
    en: {
        fileCard: {
            unnamedFile: 'Untitled file',
            downloadFile: 'Download file',
        },
        bubbleMenu: {
            alignLeft: 'Align left',
            alignCenter: 'Align center',
            alignRight: 'Align right',
        },
    },
    ja: {
        fileCard: {
            unnamedFile: '名称未設定のファイル',
            downloadFile: 'ファイルをダウンロード',
        },
        bubbleMenu: {
            alignLeft: '左揃え',
            alignCenter: '中央揃え',
            alignRight: '右揃え',
        },
    },
};

export function resolveFileUploadMessages(
    locale?: string | null,
    overrides?: DeepPartial<FileUploadMessages>
): FileUploadMessages {
    return resolveLocalizedMessages(fileUploadDictionaries, locale, overrides);
}
