# Tiptap Codeless

> A collection of powerful Tiptap extensions with zero boilerplate

**Repository:** [github.com/namelesserlx/tiptap-codeless](https://github.com/namelesserlx/tiptap-codeless)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

## 📦 Packages

- [@tiptap-codeless/core](./packages/core) - Core utilities and base classes
- [@tiptap-codeless/extension-code-block-pro](./packages/extension-code-block-pro) - Enhanced code block with syntax highlighting
- [@tiptap-codeless/extension-drag-handle](./packages/extension-drag-handle) - Drag handle: reorder blocks, insert menu, slash commands
- [@tiptap-codeless/extension-file-upload](./packages/extension-file-upload) - File upload: drag & drop, paste, image/video preview, pluggable storage

## 🚀 Quick Start

```bash
# Install
pnpm add @tiptap-codeless/extension-code-block-pro

# Use
import { CodeBlockPro } from '@tiptap-codeless/extension-code-block-pro';

const editor = useEditor({
  extensions: [
    CodeBlockPro.configure({
      languages: ['javascript', 'typescript', 'python'],
    }),
  ],
});
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev

# Type checking
pnpm type-check
```

## 📚 Documentation

Each package has its own README with installation, usage, and API. For in-depth guides, see the [Drag Handle docs](./packages/extension-drag-handle/docs).

## 📄 License

MIT © [namelesserlx](https://github.com/namelesserlx)
