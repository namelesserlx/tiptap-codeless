# @tiptap-codeless/extension-file-upload

File upload extension for Tiptap: drag & drop, paste, preview, resize, and pluggable storage.

- [English](README.md) (Current)
- [中文](https://github.com/namelesserlx/tiptap-codeless/blob/main/packages/extension-file-upload/README.zh-CN.md)
- [繁體中文](../../README.zh-TW.md)
- [日本語](../../README.ja.md)

---

## ✨ Features

- 🎯 **Drag & Drop Upload** – Drag files into the editor to upload
- 📋 **Paste Upload** – Paste images/files from clipboard
- 🖼️ **Image Preview & Resize** – Preview images instantly and resize by dragging corners
- 📐 **Image Alignment** – Support left, center, right alignment with bubble menu
- 🎬 **Video Preview** – Video files can be previewed directly in the editor
- 📁 **File Cards** – Non-image/video files displayed as cards with file information
- 💾 **Multiple Storage Modes** – Support memory, Base64, local file system, custom upload
- ⏳ **Upload Placeholder** – Shows a temporary upload placeholder and optional progress before the final asset is inserted
- ⚙️ **File Type & Size Control** – Configurable file types and size limits

---

## 📦 Installation

```bash
pnpm add @tiptap-codeless/extension-file-upload
```

This package is **ESM-only** and targets modern React + bundler setups.

Styles are **automatically injected** by the extension; you don't need to import any CSS manually.

---

## 🚀 Basic Usage

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FileUpload } from '@tiptap-codeless/extension-file-upload';

const editor = useEditor({
    extensions: [
        StarterKit,
        FileUpload.configure({
            locale: 'en',
            storage: {
                mode: 'memory', // Default
            },
        }),
    ],
});

function App() {
    return <EditorContent editor={editor} />;
}
```

---

## 💾 Storage Modes

### 1. Memory Mode (Default)

Uses Object URL, files are stored in memory only and will be lost after page refresh.

```tsx
FileUpload.configure({
    storage: {
        mode: 'memory',
    },
});
```

### 2. Base64 Mode

Converts files to Base64 Data URL, can be persisted in documents (but increases document size).

```tsx
FileUpload.configure({
    storage: {
        mode: 'base64',
    },
});
```

### 3. Local Mode

Uses File System Access API to save files to a user-selected local directory.

```tsx
FileUpload.configure({
    storage: {
        mode: 'local',
        // Optional: Provide an existing directory handle to avoid repeated popups
        directoryHandle: undefined,
        // Optional: Custom file name generator
        fileName: (file) => `${Date.now()}-${file.name}`,
        // Optional: Whether to request a new directory on each upload (default false)
        alwaysAskDirectory: false,
    },
});
```

### 4. Custom Mode

Uses a custom upload handler, suitable for uploading to OSS, cloud storage, etc.
The extension owns the editor-side placeholder; your business code only needs
to upload files and return final asset metadata.

```tsx
FileUpload.configure({
    storage: {
        mode: 'custom',
        upload: async (files, ctx) => {
            // Upload to your server or cloud storage
            const results = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    const { url } = await response.json();
                    return {
                        kind: getFileKind(file), // 'image' | 'video' | 'file'
                        url,
                        name: file.name,
                        mimeType: file.type,
                        size: file.size,
                    };
                })
            );
            return { assets: results };
        },
    },
});
```

If your upload SDK can report progress, call `ctx.onProgress`. When progress is
not available, the placeholder stays in an indeterminate loading state.

```tsx
FileUpload.configure({
    storage: {
        mode: 'custom',
        upload: async (files, ctx) => {
            const assets = await Promise.all(
                files.map((file) =>
                    uploadToCos(file, {
                        onProgress: ({ loaded, total }) => {
                            ctx.onProgress?.({ file, loaded, total });
                        },
                    })
                )
            );

            return { assets };
        },
    },
});
```

---

## ⚙️ Configuration Options

### Shared i18n options

```ts
FileUpload.configure({
    locale: 'ja',
    messages: {
        fileCard: {
            downloadFile: 'ファイルをダウンロード',
        },
    },
    ui: {
        bubbleMenu: {
            zIndex: 2400,
        },
        uploadPlaceholder: {
            enabled: true,
        },
    },
});
```

| Option                | Type                                          | Default                           | Description                                      |
| --------------------- | --------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `locale`              | `'zh-CN' \| 'zh-TW' \| 'en' \| 'ja'`          | `'zh-CN'`                         | Built-in UI locale                               |
| `messages`            | `DeepPartial<FileUploadMessages>`             | `{}`                              | Override built-in labels                         |
| `storage.mode`        | `'memory' \| 'base64' \| 'local' \| 'custom'` | `'memory'`                        | Storage mode                                     |
| `storage.upload`      | `UploadHandler`                               | `undefined`                       | Custom upload handler (required for custom mode) |
| `storage.directoryHandle` | `FileSystemDirectoryHandle`                | `undefined`                       | Reuse an existing directory handle in local mode |
| `storage.fileName`    | `(file: File) => string`                      | `undefined`                       | Custom file naming strategy                      |
| `storage.alwaysAskDirectory` | `boolean`                              | `false`                           | Force directory picker each time in local mode   |
| `picker.accept`       | `string`                                      | `undefined`                       | Accepted file types for file picker              |
| `picker.multiple`     | `boolean`                                     | `true`                            | Allow multiple selection                         |
| `ingest.paste`        | `boolean`                                     | `true`                            | Handle paste events                              |
| `ingest.drop`         | `boolean`                                     | `true`                            | Handle drop events                               |
| `ingest.allowedMimeTypes` | `string[]`                                | `undefined`                       | Allow only specific MIME types for paste/drop    |
| `ingest.maxFileSize`  | `number`                                      | `undefined`                       | Maximum file size per file (bytes)               |
| `ui.bubbleMenu`       | `{ enabled?: boolean; zIndex?: number }`      | `{ enabled: true, zIndex: 1000 }` | Bubble menu configuration                        |
| `ui.uploadPlaceholder` | `{ enabled?: boolean }`                      | `{ enabled: true }`               | Temporary upload placeholder configuration       |
| `onError`             | `(error: unknown) => void`                    | `undefined`                       | Error callback                                   |

---

## ⏳ Upload Placeholder and Progress

`FileUpload` inserts upload feedback as ProseMirror decorations, not document
nodes. This means upload placeholders are visible immediately after drag, paste,
or `insertFiles`, but they are never persisted into editor JSON.

- Upload starts: a placeholder appears at the insertion position.
- Upload succeeds: the placeholder is removed and replaced with the final image, video, or file-card node.
- Upload fails: the placeholder is removed and `onError` receives the error.
- Progress is optional: report `{ percent }` or `{ loaded, total }` through `ctx.onProgress`.

The upload transport itself remains application-owned. COS/OSS/S3 signatures,
tokens, bucket names, and final URLs should stay in your app or server code.

---

## 🔒 Read-only Mode

`FileUpload` follows Tiptap's editor-level read-only state. You don't need a separate `readonly` option in this extension.

```tsx
const editor = useEditor({
    editable: false,
    extensions: [StarterKit, FileUpload],
});

// Toggle later
editor?.setEditable(false);
editor?.setEditable(true);
```

When the editor is read-only:

- Upload entry points are disabled: `openFileDialog`, `insertFiles`, paste upload, and drag/drop upload return no-op / `false`.
- Image mutation UI is hidden: resize handles and alignment bubble menu are not shown.
- Uploaded image/video/file-card nodes are rendered for viewing and download/playback, but drag/move mutation is disabled.

---

## 💻 Commands

Once the extension is registered, you can use the following commands:

```ts
// Open file dialog
editor.commands.openFileDialog({ accept: 'image/*', multiple: true });

// Insert files directly
editor.commands.insertFiles({ files: [...] });
```

---

## 📦 Utility Functions

```tsx
import {
    createObjectUrlUpload,
    createBase64Upload,
    createLocalStorageUpload,
    createUploadHandler,
    clearCachedDirectoryHandle,
} from '@tiptap-codeless/extension-file-upload';

// Clear cached directory handle (for local mode)
clearCachedDirectoryHandle();
```

---

## 📖 Examples

### Image Resize and Alignment

After selecting an image, you can resize it by dragging the corners and set alignment (left, center, right) via the bubble menu.

### Video Preview

Uploaded video files will be displayed as playable video players in the editor.

### File Cards

Non-image/video files (such as PDF, Word, etc.) are displayed as cards with file name, file type, file size, and other information.

See the example project in the `examples/file-upload` directory for a full integration with Tiptap and React.

---

## 📄 License

MIT © [namelesserlx](https://github.com/namelesserlx)
