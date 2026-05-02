export function filterFilesByMimeTypes(files: File[], allowedMimeTypes?: string[]): File[] {
    if (!allowedMimeTypes?.length) {
        return files;
    }

    return files.filter((file) => allowedMimeTypes.includes(file.type));
}

export function hasClipboardHtmlContent(htmlContent: string): boolean {
    return htmlContent.trim().length > 0;
}
