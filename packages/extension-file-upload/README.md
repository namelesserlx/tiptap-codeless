# @tiptap-codeless/extension-file-upload

File upload extension for Tiptap: drag & drop, paste, preview, resize, and pluggable storage.

- [English](README.md) (Current)
- [中文](README.zh.md)

---

## ✨ Features

- 🎯 **Drag & Drop Upload** – Drag files into the editor to upload
- 📋 **Paste Upload** – Paste images/files from clipboard
- 🖼️ **Image Preview & Resize** – Preview images instantly and resize by dragging corners
- 📐 **Image Alignment** – Support left, center, right alignment with bubble menu
- 🎬 **Video Preview** – Video files can be previewed directly in the editor
- 📁 **File Cards** – Non-image/video files displayed as cards with file information
- 💾 **Multiple Storage Modes** – Support memory, Base64, local file system, custom upload
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
            storageMode: 'memory', // Default
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
    storageMode: 'memory',
});
```

### 2. Base64 Mode

Converts files to Base64 Data URL, can be persisted in documents (but increases document size).

```tsx
FileUpload.configure({
    storageMode: 'base64',
});
```

### 3. Local Mode

Uses File System Access API to save files to a user-selected local directory.

```tsx
FileUpload.configure({
    storageMode: 'local',
    localStorageOptions: {
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

```tsx
FileUpload.configure({
    storageMode: 'custom',
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
});
```

---

## ⚙️ Configuration Options

| Option                | Type                                          | Default                           | Description                                      |
| --------------------- | --------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `storageMode`         | `'memory' \| 'base64' \| 'local' \| 'custom'` | `'memory'`                        | Storage mode                                     |
| `localStorageOptions` | `LocalStorageOptions`                         | `undefined`                       | Local storage options (local mode only)          |
| `imgBubbleMenuConfig` | `{ enabled?: boolean; zIndex?: number }`      | `{ enabled: true, zIndex: 1000 }` | Image bubble menu configuration                  |
| `upload`              | `UploadHandler`                               | `undefined`                       | Custom upload handler (required for custom mode) |
| `accept`              | `string`                                      | `undefined`                       | Accepted file types for file picker              |
| `multiple`            | `boolean`                                     | `true`                            | Allow multiple selection                         |
| `handlePaste`         | `boolean`                                     | `true`                            | Handle paste events                              |
| `handleDrop`          | `boolean`                                     | `true`                            | Handle drop events                               |
| `maxFileSize`         | `number`                                      | `undefined`                       | Maximum file size per file (bytes)               |
| `onError`             | `(error: unknown) => void`                    | `undefined`                       | Error callback                                   |

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
