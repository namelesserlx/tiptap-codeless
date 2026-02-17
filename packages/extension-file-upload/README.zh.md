# @tiptap-codeless/extension-file-upload

Tiptap 文件上传扩展：支持拖拽、粘贴、预览、缩放和可插拔存储。

- [English](README.md)
- [中文](README.zh.md) (当前)

---

## ✨ 特性

- 🎯 **拖拽上传** – 支持将文件拖拽到编辑器中上传
- 📋 **粘贴上传** – 支持从剪贴板粘贴图片/文件
- 🖼️ **图片预览与缩放** – 图片即时预览，选中后可通过四角拖拽缩放
- 📐 **图片对齐** – 支持左对齐、居中、右对齐（带气泡菜单）
- 🎬 **视频预览** – 视频文件可直接在编辑器中预览播放
- 📁 **文件卡片** – 非图片/视频文件以卡片形式展示，包含文件信息
- 💾 **多种存储模式** – 支持内存、Base64、本地文件系统、自定义上传
- ⚙️ **文件类型与大小控制** – 可配置接受的文件类型和大小限制

---

## 📦 安装

```bash
pnpm add @tiptap-codeless/extension-file-upload
```

本包是 **ESM-only**，面向现代 React + 打包工具。

样式会在扩展初始化时 **自动注入**，无需单独引入 CSS。

---

## 🚀 基本用法

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FileUpload } from '@tiptap-codeless/extension-file-upload';

const editor = useEditor({
    extensions: [
        StarterKit,
        FileUpload.configure({
            storageMode: 'memory', // 默认值
        }),
    ],
});

function App() {
    return <EditorContent editor={editor} />;
}
```

---

## 💾 存储模式

### 1. Memory 模式（默认）

使用 Object URL，文件仅在内存中，刷新页面后丢失。

```tsx
FileUpload.configure({
    storageMode: 'memory',
});
```

### 2. Base64 模式

将文件转换为 Base64 Data URL，可以持久化到文档中（但会增大文档体积）。

```tsx
FileUpload.configure({
    storageMode: 'base64',
});
```

### 3. Local 模式

使用 File System Access API 将文件保存到用户选择的本地目录。

```tsx
FileUpload.configure({
    storageMode: 'local',
    localStorageOptions: {
        // 可选：提供已有的目录句柄，避免重复弹窗选择
        directoryHandle: undefined,
        // 可选：自定义文件名生成器
        fileName: (file) => `${Date.now()}-${file.name}`,
        // 可选：是否在每次上传时都请求新的目录（默认 false）
        alwaysAskDirectory: false,
    },
});
```

### 4. Custom 模式

使用自定义上传处理器，适用于上传到 OSS、云存储等场景。

```tsx
FileUpload.configure({
    storageMode: 'custom',
    upload: async (files, ctx) => {
        // 上传到你的服务器或云存储
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

## ⚙️ 配置选项

| 选项                  | 类型                                          | 默认值                            | 描述                                   |
| --------------------- | --------------------------------------------- | --------------------------------- | -------------------------------------- |
| `storageMode`         | `'memory' \| 'base64' \| 'local' \| 'custom'` | `'memory'`                        | 存储模式                               |
| `localStorageOptions` | `LocalStorageOptions`                         | `undefined`                       | 本地保存选项（仅 local 模式）          |
| `imgBubbleMenuConfig` | `{ enabled?: boolean; zIndex?: number }`      | `{ enabled: true, zIndex: 1000 }` | 图片气泡菜单配置                       |
| `upload`              | `UploadHandler`                               | `undefined`                       | 自定义上传处理器（仅 custom 模式必填） |
| `accept`              | `string`                                      | `undefined`                       | 文件选择器接受的文件类型               |
| `multiple`            | `boolean`                                     | `true`                            | 是否允许多选                           |
| `handlePaste`         | `boolean`                                     | `true`                            | 是否处理粘贴事件                       |
| `handleDrop`          | `boolean`                                     | `true`                            | 是否处理拖放事件                       |
| `maxFileSize`         | `number`                                      | `undefined`                       | 单文件最大大小（字节）                 |
| `onError`             | `(error: unknown) => void`                    | `undefined`                       | 错误回调                               |

---

## 💻 可用命令

注册扩展后，你可以使用以下命令：

```ts
// 打开文件选择器
editor.commands.openFileDialog({ accept: 'image/*', multiple: true });

// 直接插入文件
editor.commands.insertFiles({ files: [...] });
```

---

## 📦 工具函数

```tsx
import {
    createObjectUrlUpload,
    createBase64Upload,
    createLocalStorageUpload,
    createUploadHandler,
    clearCachedDirectoryHandle,
} from '@tiptap-codeless/extension-file-upload';

// 清除缓存的目录句柄（用于 local 模式）
clearCachedDirectoryHandle();
```

---

## 📖 示例

### 图片缩放和对齐

选中图片后，可以通过四角拖拽调整图片大小，并通过气泡菜单设置对齐方式（左对齐、居中、右对齐）。

### 视频预览

上传的视频文件会在编辑器中显示为可播放的视频播放器。

### 文件卡片

非图片/视频文件（如 PDF、Word 等）会以卡片形式展示，包含文件名、文件类型、文件大小等信息。

你可以在仓库中的 `examples/file-upload` 目录查看完整示例（包含 React + Tiptap 集成）。

---

## 📄 许可证

MIT © [namelesserlx](https://github.com/namelesserlx)
