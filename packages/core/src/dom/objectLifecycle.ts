export interface ObjectLifecycleRegistry {
    track: (key: string) => void;
    untrack: (key: string) => void;
    releaseMissing: (active: Set<string>) => void;
    releaseAll: () => void;
    snapshot: () => string[];
}

export function createObjectLifecycleRegistry(
    release: (key: string) => void
): ObjectLifecycleRegistry {
    const tracked = new Set<string>();

    return {
        track(key) {
            tracked.add(key);
        },
        untrack(key) {
            tracked.delete(key);
        },
        releaseMissing(active) {
            for (const key of Array.from(tracked)) {
                if (!active.has(key)) {
                    release(key);
                    tracked.delete(key);
                }
            }
        },
        releaseAll() {
            for (const key of Array.from(tracked)) {
                release(key);
                tracked.delete(key);
            }
        },
        snapshot() {
            return Array.from(tracked);
        },
    };
}
