const LANGUAGE_CLASS_PREFIX = 'language-';

function getClassName(element: Element): string {
    if (typeof element.className === 'string') {
        return element.className;
    }

    return element.getAttribute('class') ?? '';
}

export function extractLanguageFromClassName(className: string): string | null {
    const token = className
        .split(/\s+/)
        .find(
            (classToken) =>
                classToken.startsWith(LANGUAGE_CLASS_PREFIX) &&
                classToken.length > LANGUAGE_CLASS_PREFIX.length
        );

    return token ? token.slice(LANGUAGE_CLASS_PREFIX.length) : null;
}

export function parseLanguageAttribute(
    element: Element,
    defaultLanguage?: string | null
): string | null | undefined {
    const dataLanguage = element.getAttribute('data-language');
    if (dataLanguage) {
        return dataLanguage;
    }

    const elementLanguage = extractLanguageFromClassName(getClassName(element));
    if (elementLanguage) {
        return elementLanguage;
    }

    const codeElement = element.querySelector('code');
    if (codeElement) {
        const codeLanguage = extractLanguageFromClassName(getClassName(codeElement));
        if (codeLanguage) {
            return codeLanguage;
        }
    }

    return defaultLanguage;
}

export function renderLanguageAttribute(language?: string | null) {
    if (!language) {
        return {};
    }

    return {
        'data-language': language,
        class: `${LANGUAGE_CLASS_PREFIX}${language}`,
    };
}
