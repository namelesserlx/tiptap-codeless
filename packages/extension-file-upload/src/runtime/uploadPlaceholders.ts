import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { FileKind, UploadProgress } from '@/types';

export type UploadPlaceholder = {
    id: string;
    pos: number;
    kind: FileKind;
    name: string;
    mimeType: string;
    size: number;
    statusLabel: string;
    percent?: number;
};

export type UploadPlaceholderMeta =
    | {
          type: 'add';
          placeholders: UploadPlaceholder[];
      }
    | {
          type: 'update';
          ids: string[];
          percent?: number;
      }
    | {
          type: 'remove';
          ids: string[];
      };

export type UploadPlaceholderPluginState = {
    placeholders: UploadPlaceholder[];
    decorations: DecorationSet;
};

let placeholderId = 0;

export function createUploadPlaceholderId(): string {
    placeholderId += 1;
    return `tiptap-file-upload-${Date.now().toString(36)}-${placeholderId.toString(36)}`;
}

export function normalizeUploadProgressPercent(progress: UploadProgress): number | undefined {
    if (typeof progress.percent === 'number' && Number.isFinite(progress.percent)) {
        return clampPercent(progress.percent);
    }

    if (
        typeof progress.loaded === 'number' &&
        Number.isFinite(progress.loaded) &&
        typeof progress.total === 'number' &&
        Number.isFinite(progress.total) &&
        progress.total > 0
    ) {
        return clampPercent((progress.loaded / progress.total) * 100);
    }

    return undefined;
}

export function createUploadPlaceholderState(
    doc: ProseMirrorNode,
    placeholders: UploadPlaceholder[]
): UploadPlaceholderPluginState {
    return {
        placeholders,
        decorations: DecorationSet.create(
            doc,
            placeholders.map((placeholder) =>
                Decoration.widget(
                    clampPosition(placeholder.pos, doc),
                    () => createPlaceholderElement(placeholder),
                    {
                        key: `${placeholder.id}:${placeholder.percent ?? 'pending'}`,
                        side: 1,
                    }
                )
            )
        ),
    };
}

export function applyUploadPlaceholderTransaction(
    transaction: Transaction,
    previous: UploadPlaceholderPluginState,
    meta: UploadPlaceholderMeta | undefined
): UploadPlaceholderPluginState {
    let placeholders = previous.placeholders.map((placeholder) => ({
        ...placeholder,
        pos: transaction.mapping.map(placeholder.pos),
    }));

    if (meta?.type === 'add') {
        placeholders = [...placeholders, ...meta.placeholders];
    }

    if (meta?.type === 'update') {
        const ids = new Set(meta.ids);
        placeholders = placeholders.map((placeholder) =>
            ids.has(placeholder.id)
                ? {
                      ...placeholder,
                      percent: meta.percent,
                  }
                : placeholder
        );
    }

    if (meta?.type === 'remove') {
        const ids = new Set(meta.ids);
        placeholders = placeholders.filter((placeholder) => !ids.has(placeholder.id));
    }

    return createUploadPlaceholderState(transaction.doc, placeholders);
}

export function findUploadPlaceholderPosition(
    state: UploadPlaceholderPluginState | undefined,
    ids: string[]
): number | undefined {
    const idSet = new Set(ids);
    const positions = state?.placeholders
        .filter((placeholder) => idSet.has(placeholder.id))
        .map((placeholder) => placeholder.pos);

    if (!positions?.length) {
        return undefined;
    }

    return Math.min(...positions);
}

function clampPercent(percent: number): number {
    return Math.max(0, Math.min(100, Math.round(percent)));
}

function clampPosition(pos: number, doc: ProseMirrorNode): number {
    return Math.max(0, Math.min(pos, doc.content.size));
}

function createPlaceholderElement(placeholder: UploadPlaceholder): HTMLElement {
    const root = document.createElement('span');
    const progressLabel =
        typeof placeholder.percent === 'number'
            ? `${placeholder.percent}%`
            : placeholder.statusLabel;

    root.className = [
        'tiptap-upload-placeholder',
        `tiptap-upload-placeholder--${placeholder.kind}`,
    ].join(' ');
    root.setAttribute('data-tiptap-upload-placeholder', 'true');
    root.setAttribute('data-upload-kind', placeholder.kind);
    root.contentEditable = 'false';

    const icon = document.createElement('span');
    icon.className = 'tiptap-upload-placeholder__icon';
    icon.textContent =
        placeholder.kind === 'image' ? 'IMG' : placeholder.kind === 'video' ? 'VID' : 'FILE';
    icon.setAttribute('aria-hidden', 'true');

    const body = document.createElement('span');
    body.className = 'tiptap-upload-placeholder__body';

    const name = document.createElement('span');
    name.className = 'tiptap-upload-placeholder__name';
    name.textContent = placeholder.name;

    const meta = document.createElement('span');
    meta.className = 'tiptap-upload-placeholder__meta';
    meta.textContent = `${placeholder.statusLabel} - ${formatFileSize(placeholder.size)}`;

    const progress = document.createElement('span');
    progress.className = 'tiptap-upload-placeholder__progress';
    progress.setAttribute('data-tiptap-upload-placeholder-progress', 'true');
    progress.textContent = progressLabel;

    const track = document.createElement('span');
    track.className = 'tiptap-upload-placeholder__track';

    const bar = document.createElement('span');
    bar.className = 'tiptap-upload-placeholder__bar';

    if (typeof placeholder.percent === 'number') {
        bar.style.width = `${placeholder.percent}%`;
    } else {
        root.setAttribute('data-upload-progress', 'indeterminate');
    }

    track.appendChild(bar);
    body.append(name, meta, track);
    root.append(icon, body, progress);

    return root;
}

function formatFileSize(size: number): string {
    if (!Number.isFinite(size) || size <= 0) {
        return '0 B';
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
