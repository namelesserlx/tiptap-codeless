export type SupportedLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja';

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends (...args: never[]) => unknown
        ? T[K]
        : T[K] extends readonly unknown[]
          ? T[K]
          : T[K] extends Record<string, unknown>
            ? DeepPartial<T[K]>
            : T[K];
};

const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneMessageValue<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as T;
    }

    if (isPlainObject(value)) {
        const result: Record<string, unknown> = {};

        for (const [key, child] of Object.entries(value)) {
            result[key] = cloneMessageValue(child);
        }

        return result as T;
    }

    return value;
}

export function resolveLocale(locale?: string | null): SupportedLocale {
    if (!locale) {
        return DEFAULT_LOCALE;
    }

    const normalized = locale.trim().replace(/_/g, '-').toLowerCase();

    if (
        normalized === 'zh-tw' ||
        normalized === 'zh-hk' ||
        normalized === 'zh-mo' ||
        normalized.startsWith('zh-hant')
    ) {
        return 'zh-TW';
    }

    if (normalized === 'zh-cn' || normalized.startsWith('zh-hans') || normalized.startsWith('zh'))
    {
        return 'zh-CN';
    }

    if (normalized.startsWith('ja')) {
        return 'ja';
    }

    if (normalized.startsWith('en')) {
        return 'en';
    }

    return DEFAULT_LOCALE;
}

export function mergeLocalizedMessages<T extends object>(
    base: T,
    overrides?: DeepPartial<T>
): T {
    if (!overrides) {
        return cloneMessageValue(base);
    }

    const result = cloneMessageValue(base) as Record<string, unknown>;

    for (const key of Object.keys(overrides) as (keyof T)[]) {
        const overrideValue = overrides[key];

        if (overrideValue === undefined) {
            continue;
        }

        const baseValue = result[key as string];

        if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
            result[key as string] = mergeLocalizedMessages(
                baseValue,
                overrideValue as DeepPartial<typeof baseValue>
            );
            continue;
        }

        result[key as string] = overrideValue;
    }

    return result as T;
}

export function resolveLocalizedMessages<T extends object>(
    dictionaries: Record<SupportedLocale, T>,
    locale?: string | null,
    overrides?: DeepPartial<T>
): T {
    return mergeLocalizedMessages(dictionaries[resolveLocale(locale)], overrides);
}

export function formatLocalizedMessage(
    template: string,
    values?: Record<string, string | number | null | undefined>
): string {
    if (!values) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = values[key];
        return value === null || value === undefined ? '' : String(value);
    });
}
