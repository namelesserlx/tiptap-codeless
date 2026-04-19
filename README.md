# Tiptap Codeless

Production-ready Tiptap extensions for modern React apps: advanced code blocks, drag handles with slash menus, and file upload workflows with zero boilerplate.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

Docs:
- [English](README.md)
- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)

## Why This Repo

- Built for real Tiptap editors, not toy demos.
- Published as separate npm packages so you only install what you need.
- Shared extension conventions: `locale`, `messages`, and forward-compatible `ui` config.
- Built-in UI localization for `zh-CN`, `zh-TW`, `en`, and `ja`.
- React + TypeScript friendly, with automatic style injection and workspace examples.

## Packages

| Package | What it solves |
| --- | --- |
| [`@tiptap-codeless/core`](./packages/core) | Shared runtime helpers, i18n helpers, style injection, and React hooks |
| [`@tiptap-codeless/extension-code-block-pro`](./packages/extension-code-block-pro) | Syntax-highlighted code blocks with Mermaid, fullscreen, folding, line numbers, and language switching |
| [`@tiptap-codeless/extension-drag-handle`](./packages/extension-drag-handle) | Block drag handle, insert handle, and slash-triggered insert menu |
| [`@tiptap-codeless/extension-file-upload`](./packages/extension-file-upload) | Drag-and-drop file upload, paste upload, image resize/alignment, video preview, and file cards |

## Quick Start

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
                locale: 'en',
                theme: 'auto',
            }),
        ],
    });

    return <EditorContent editor={editor} />;
}
```

## Shared Extension API

The three UI extensions now share the same internationalization entry points:

```ts
SomeExtension.configure({
    locale: 'ja',
    messages: {
        // Override only the labels you need
    },
    ui: {
        // Extension-specific UI layer config
    },
});
```

Supported locales:
- `zh-CN`
- `zh-TW`
- `en`
- `ja`

## Examples

This repo ships workspace examples you can run locally:

```bash
pnpm install
pnpm --filter ./examples/code-block-pro dev
pnpm --filter ./examples/drag-handle dev
pnpm --filter ./examples/file-upload dev
```

## Development

```bash
pnpm install
pnpm test:run
pnpm type-check
pnpm build
pnpm --filter "./examples/**" build
```

## Package Docs

- [`packages/core/README.md`](./packages/core/README.md)
- [`packages/extension-code-block-pro/README.md`](./packages/extension-code-block-pro/README.md)
- [`packages/extension-drag-handle/README.md`](./packages/extension-drag-handle/README.md)
- [`packages/extension-file-upload/README.md`](./packages/extension-file-upload/README.md)

## License

MIT © [namelesserlx](https://github.com/namelesserlx)
