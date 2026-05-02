import { createObjectLifecycleRegistry } from '@tiptap-codeless/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

function collectManagedUrls(doc: ProseMirrorNode): Set<string> {
    const urls = new Set<string>();

    doc.descendants((node) => {
        const src = typeof node.attrs?.src === 'string' ? node.attrs.src : null;
        const url = typeof node.attrs?.url === 'string' ? node.attrs.url : null;

        if (src?.startsWith('blob:')) {
            urls.add(src);
        }

        if (url?.startsWith('blob:')) {
            urls.add(url);
        }

        return true;
    });

    return urls;
}

export type ManagedObjectUrlRegistry = {
    track: (url: string) => void;
    sync: (doc: ProseMirrorNode) => void;
    revokeAll: () => void;
};

export function createManagedObjectUrlRegistry(): ManagedObjectUrlRegistry {
    const registry = createObjectLifecycleRegistry((url) => {
        URL.revokeObjectURL(url);
    });

    return {
        track(url) {
            if (!url.startsWith('blob:')) {
                return;
            }

            registry.track(url);
        },
        sync(doc) {
            registry.releaseMissing(collectManagedUrls(doc));
        },
        revokeAll() {
            registry.releaseAll();
        },
    };
}
