# Tiptap Codeless

面向现代 React 应用的生产级 Tiptap 扩展集合：增强代码块、拖拽手柄与斜杠菜单、文件上传工作流，尽量减少接入样板代码。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

文档：
- [English](README.md)
- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)

## 这个仓库解决什么问题

- 面向真实编辑器场景，而不只是演示 Demo。
- 以独立 npm 包发布，按需安装即可。
- 三个主要扩展统一采用 `locale`、`messages`、`ui` 配置约定，降低学习和迁移成本。
- 内置 `zh-CN`、`zh-TW`、`en`、`ja` 四种界面语言。
- 对 React + TypeScript 友好，并提供可运行的示例工程。

## 包列表

| 包名 | 作用 |
| --- | --- |
| [`@tiptap-codeless/core`](./packages/core) | 共享运行时工具、i18n 工具、样式注入与 React hooks |
| [`@tiptap-codeless/extension-code-block-pro`](./packages/extension-code-block-pro) | 代码高亮、Mermaid、全屏、折叠、行号、语言切换 |
| [`@tiptap-codeless/extension-drag-handle`](./packages/extension-drag-handle) | 块拖拽手柄、插入手柄、斜杠菜单 |
| [`@tiptap-codeless/extension-file-upload`](./packages/extension-file-upload) | 拖拽上传、粘贴上传、图片缩放/对齐、视频预览、文件卡片 |

## 快速开始

```bash
pnpm add @tiptap-codeless/extension-code-block-pro lowlight
```

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockPro } from '@tiptap-codeless/extension-code-block-pro';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);

export function DemoEditor() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            CodeBlockPro.configure({
                lowlight,
                locale: 'zh-CN',
                theme: 'auto',
            }),
        ],
    });

    return <EditorContent editor={editor} />;
}
```

## 统一配置约定

三个主要 UI 扩展现在共享同一套国际化入口：

```ts
SomeExtension.configure({
    locale: 'zh-CN',
    messages: {
        // 只覆盖需要改写的文案
    },
    ui: {
        // 扩展自己的 UI 层配置
    },
});
```

支持的语言：
- `zh-CN`
- `zh-TW`
- `en`
- `ja`

## 示例

仓库内置了可直接运行的示例：

```bash
pnpm install
pnpm --filter ./examples/code-block-pro dev
pnpm --filter ./examples/drag-handle dev
pnpm --filter ./examples/file-upload dev
```

## 本地开发

```bash
pnpm install
pnpm test:run
pnpm type-check
pnpm build
pnpm --filter "./examples/**" build
```

## 包文档

- [`packages/core/README.md`](./packages/core/README.md)
- [`packages/extension-code-block-pro/README.md`](./packages/extension-code-block-pro/README.md)
- [`packages/extension-drag-handle/README.md`](./packages/extension-drag-handle/README.md)
- [`packages/extension-file-upload/README.md`](./packages/extension-file-upload/README.md)

## License

MIT © [namelesserlx](https://github.com/namelesserlx)
