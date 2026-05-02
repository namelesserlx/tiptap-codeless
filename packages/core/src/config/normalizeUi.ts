function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as T;
    }

    if (isPlainObject(value)) {
        const result: Record<string, unknown> = {};

        for (const [key, child] of Object.entries(value)) {
            result[key] = cloneValue(child);
        }

        return result as T;
    }

    return value;
}

export function mergeUiConfig<T extends Record<string, unknown>>(
    ...parts: Array<Partial<T> | undefined>
): T {
    const result: Record<string, unknown> = {};

    for (const part of parts) {
        if (!part) {
            continue;
        }

        for (const [key, value] of Object.entries(part)) {
            if (value === undefined) {
                continue;
            }

            const existing = result[key];

            if (isPlainObject(existing) && isPlainObject(value)) {
                result[key] = mergeUiConfig(
                    existing as Record<string, unknown>,
                    value as Record<string, unknown>
                );
                continue;
            }

            result[key] = cloneValue(value);
        }
    }

    return result as T;
}
