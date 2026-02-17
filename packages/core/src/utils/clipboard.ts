/**
 * 剪贴板操作工具函数
 */

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // 优先使用现代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // 降级方案：使用 execCommand
        return copyToClipboardFallback(text);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * 复制到剪贴板的降级方案
 * @param text 要复制的文本
 */
function copyToClipboardFallback(text: string): boolean {
    const textArea = document.createElement('textarea');

    // 设置样式使其不可见
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (error) {
        console.error('execCommand copy failed:', error);
    }

    document.body.removeChild(textArea);
    return successful;
}

/**
 * 从 DOM 元素中提取文本内容
 * @param element DOM 元素
 * @param selectors 可选的子元素选择器数组，按优先级排序
 */
export function extractTextFromElement(element: Element, selectors?: string[]): string {
    if (!element) return '';

    // 如果提供了选择器，按优先级尝试
    if (selectors && selectors.length > 0) {
        for (const selector of selectors) {
            const targetElement = element.querySelector(selector);
            if (targetElement && targetElement.textContent?.trim()) {
                return targetElement.textContent.trim();
            }
        }
    }

    // 降级方案：直接返回元素的文本内容
    return element.textContent?.trim() || '';
}
