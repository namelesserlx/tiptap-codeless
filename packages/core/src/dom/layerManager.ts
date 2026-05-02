export interface LayerManagerOptions {
    base?: number;
    step?: number;
}

export interface LayerManager {
    get: (key: string) => number;
    entries: () => Array<[string, number]>;
}

export function createLayerManager(options: LayerManagerOptions = {}): LayerManager {
    const { base = 1000, step = 10 } = options;
    const slots = new Map<string, number>();

    return {
        get(key) {
            const existing = slots.get(key);

            if (existing !== undefined) {
                return existing;
            }

            const next = base + slots.size * step;
            slots.set(key, next);
            return next;
        },
        entries() {
            return Array.from(slots.entries());
        },
    };
}
