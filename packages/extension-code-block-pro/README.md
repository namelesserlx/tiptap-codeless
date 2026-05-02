# @tiptap-codeless/extension-code-block-pro

Enhanced code block extension for Tiptap with macOS-style chrome, syntax highlighting, Mermaid diagrams, and rich UX.

- [English](README.md) (Current)
- [中文](https://github.com/namelesserlx/tiptap-codeless/blob/main/packages/extension-code-block-pro/README.zh-CN.md)
- [繁體中文](../../README.zh-TW.md)
- [日本語](../../README.ja.md)

---

## ✨ Features

- 🎯 **macOS-style header**: Classic three buttons (close, collapse, fullscreen)
- 🌓 **Light / Dark / Auto theme**: Follows system theme or forced light/dark
- 🔢 **Line numbers**: Toggleable, configurable start line
- 📁 **Code folding**: Collapse long blocks with “expand all” affordance
- 🎨 **Syntax highlighting**: Powered by `lowlight` (highlight.js ecosystem)
- 🌈 **Language switcher**: 20+ common languages with aliases
- 📋 **Copy to clipboard**: One-click copy with feedback state
- 📊 **Mermaid diagrams**: Optional Mermaid rendering for `mermaid` code blocks
- 🛠️ **Highly customizable**: Headers, toolbar, layout, attributes, CSS variables
- ♿ **Accessibility**: Keyboard friendly, semantic markup

---

## 📦 Installation

```bash
pnpm add @tiptap-codeless/extension-code-block-pro lowlight

# Optional, only if you need Mermaid diagram support
pnpm add mermaid
```

This package is **ESM-only** and targets modern React + bundler setups.

Styles are **automatically injected** by the extension, you don’t need to import any CSS manually.

---

## 🚀 Basic Usage

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockPro } from '@tiptap-codeless/extension-code-block-pro';
import { createLowlight } from 'lowlight';

// Import languages you actually need
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';

// Create lowlight instance
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

const editor = useEditor({
    extensions: [
        StarterKit.configure({
            codeBlock: false, // Disable built-in codeBlock if you want to replace it
        }),
        CodeBlockPro.configure({
            lowlight,
            locale: 'en',
            defaultLanguage: 'javascript',
            theme: 'auto', // 'light' | 'dark' | 'auto'
        }),
    ],
});

function App() {
    return <EditorContent editor={editor} />;
}
```

---

## 📊 Mermaid Support (Optional)

`CodeBlockPro` can render **Mermaid diagrams** when:

- The code block language is set to `'mermaid'`
- You have `mermaid` installed in your app

```bash
pnpm add mermaid
```

The extension:

- Does **not** bundle `mermaid` itself (it's an optional peer dependency)
- Uses **dynamic import** so Mermaid code is only loaded when you actually render a Mermaid block and toggle the diagram view

### Mermaid Diagram Examples

Select `mermaid` as the language in the editor, then enter code like the following to switch to diagram view:

```mermaid
graph LR
    A[User Input] --> B[CodeBlockPro Extension]
    B --> C[Mermaid Renders SVG]
    C --> D[Display in Editor]
```

You can also use more complex syntax, such as sequence diagrams:

```mermaid
sequenceDiagram
    participant U as User
    participant E as Editor
    participant M as Mermaid

    U->>E: Input mermaid code block
    E->>M: Pass text content
    M-->>E: Return rendered SVG
    E-->>U: Display diagram
```

---

## ⚙️ Configuration Options

### Shared i18n options

```ts
CodeBlockPro.configure({
    locale: 'ja',
    messages: {
        toolbar: {
            copyCode: 'コードをコピー',
        },
    },
    ui: {
        layers: {
            languageDropdown: 2400,
        },
    },
});
```

| Option                          | Type                          | Default                                                                             | Description                                                               |
| ------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `locale`                        | `'zh-CN' \| 'zh-TW' \| 'en' \| 'ja'` | `'zh-CN'`                                                                     | Built-in UI locale                                                        |
| `messages`                      | `DeepPartial<CodeBlockProMessages>` | `{}`                                                                           | Override built-in labels                                                  |
| `lowlight`                      | `Lowlight`                    | `undefined`                                                                         | Lowlight instance for syntax highlighting                                 |
| `languages`                     | `LanguageConfig[]`            | `defaultLanguages`                                                                  | Available languages in the language selector                              |
| `defaultLanguage`               | `string \| null`              | `null`                                                                              | Default language for new code blocks                                      |
| `theme`                         | `'light' \| 'dark' \| 'auto'` | `'auto'`                                                                            | Theme mode                                                                |
| `windowControls`                | `WindowControlsConfig`        | `{ close: true, collapse: true, fullscreen: true }`                                 | macOS-style header controls configuration                                 |
| `windowControls.close`          | `boolean`                     | `true`                                                                              | Show close button                                                         |
| `windowControls.collapse`       | `boolean`                     | `true`                                                                              | Show collapse button                                                      |
| `windowControls.fullscreen`     | `boolean`                     | `true`                                                                              | Show fullscreen button                                                    |
| `windowControls.onClose`        | `(node, pos) => void`         | `undefined`                                                                         | Close button click callback                                               |
| `windowControls.onFullscreen`   | `(node, pos) => void`         | `undefined`                                                                         | Fullscreen button click callback                                          |
| `toolbar`                       | `ToolbarConfig`               | `{ language: true, copy: true, lineNumbers: true }`                                 | Toolbar configuration                                                     |
| `toolbar.language`              | `boolean`                     | `true`                                                                              | Show language selector                                                    |
| `toolbar.copy`                  | `boolean`                     | `true`                                                                              | Show copy button                                                          |
| `toolbar.lineNumbers`           | `boolean`                     | `true`                                                                              | Show line numbers toggle button                                           |
| `lineNumbers`                   | `LineNumbersConfig`           | `{ enabled: true, start: 1, allowToggle: true }`                                    | Line numbers configuration                                                |
| `lineNumbers.enabled`           | `boolean`                     | `true`                                                                              | Enable line numbers by default                                            |
| `lineNumbers.start`             | `number`                      | `1`                                                                                 | Starting line number                                                      |
| `lineNumbers.allowToggle`       | `boolean`                     | `true`                                                                              | Allow toggling line numbers                                               |
| `collapse`                      | `CollapseConfig`              | `{ enabled: true, defaultCollapsed: false, visibleLines: 3 }`                       | Code folding configuration                                                |
| `collapse.enabled`              | `boolean`                     | `true`                                                                              | Enable code folding                                                       |
| `collapse.defaultCollapsed`     | `boolean`                     | `false`                                                                             | Default collapsed state                                                   |
| `collapse.visibleLines`         | `number`                      | `3`                                                                                 | Number of lines to show when collapsed                                    |
| `rendering`                     | `RenderingConfig`             | `{ lazy: false, rootMargin: '100px', placeholderHeight: 100 }`                      | Render performance configuration                                          |
| `rendering.lazy`                | `boolean`                     | `false`                                                                             | Enable lazy render (only render when in viewport)                         |
| `rendering.rootMargin`          | `string`                      | `'100px'`                                                                           | IntersectionObserver root margin (e.g. start render 100px before visible) |
| `rendering.placeholderHeight`   | `number`                      | `100`                                                                               | Placeholder height (px) before content is rendered                        |
| `HTMLAttributes`                | `Record<string, any>`         | `{ class: 'code-block-pro' }`                                                       | Additional HTML attributes                                                |
| `ui.layers.languageDropdown`    | `number`                      | `1000`                                                                              | Dropdown stacking order                                                   |

---

## 🔒 Read-only Mode

`CodeBlockPro` follows Tiptap's editor-level read-only state. You don't need a separate `readonly` option in this extension.

```tsx
const editor = useEditor({
    editable: false,
    extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockPro.configure({ lowlight }),
    ],
});

// Toggle later
editor?.setEditable(false);
editor?.setEditable(true);
```

When the editor is read-only:

- Document mutations are disabled: editing code text, changing language, deleting the block, and mutating command APIs return no-op / `false`.
- View-only controls remain available: copy, fullscreen, collapse/expand, line-number visibility, and Mermaid code/diagram preview.
- View-only toggles do not persist to the document JSON while read-only.

---

## 💻 Commands

Once the extension is registered, you can use the following commands:

```ts
// Set a code block (with language)
editor.commands.setCodeBlock({ language: 'javascript' });

// Toggle between code block and paragraph
editor.commands.toggleCodeBlock({ language: 'typescript' });

// Update language of the current code block
editor.commands.updateCodeBlockLanguage('python');

// Toggle collapsed state of current code block
editor.commands.toggleCodeBlockCollapse();

// Toggle line numbers of current code block
editor.commands.toggleCodeBlockLineNumbers();
```

---

## 🎨 Theming

### Built-in Theme Switch

```ts
// Force light theme
CodeBlockPro.configure({ theme: 'light' });

// Force dark theme
CodeBlockPro.configure({ theme: 'dark' });

// Auto switch by system preference
CodeBlockPro.configure({ theme: 'auto' });
```

### Customizing via CSS Variables

All visual styles are driven by CSS variables, so you can override them in your own stylesheet:

```css
.code-block-pro-wrapper {
    --cbp-bg: #ffffff;
    --cbp-text: #24292e;
    --cbp-border: #d0d7de;
    --cbp-accent-color: #3b82f6;
    --cbp-font-mono:
        ui-monospace, 'SFMono-Regular', 'SF Mono', 'Cascadia Mono', 'Segoe UI Mono',
        'Liberation Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    /* More variables can be found in src/styles/*.css */
}
```

By default, CodeBlock Pro uses a single system monospace stack for the wrapper and code content, which matches common editor best practices and avoids shipping bundled font assets. If your product needs a stricter visual baseline, override `--cbp-font-mono` from your app stylesheet.

You can also add different prefix classes (e.g., `theme-dark`) for more fine-grained control.

---

## ⚙️ Configuration Overview

All configuration options are typed via `CodeBlockProOptions`. Here's a quick example:

```ts
CodeBlockPro.configure({
    lowlight, // Required for syntax highlighting
    defaultLanguage: 'javascript',
    theme: 'auto',
    windowControls: {
        close: true,
        collapse: true,
        fullscreen: true,
    },
    toolbar: {
        language: true,
        copy: true,
        lineNumbers: true,
    },
    lineNumbers: {
        enabled: true,
        start: 1,
        allowToggle: true,
    },
    collapse: {
        enabled: true,
        defaultCollapsed: false,
        visibleLines: 3,
    },
    rendering: {
        lazy: false, // Enable for pages with many code blocks
        rootMargin: '100px',
        placeholderHeight: 100,
    },
});
```

---

## 📖 Examples

See the example project in `examples/code-block-pro` directory for a full integration with Tiptap and React.

---

## 📄 License

MIT © [namelesserlx](https://github.com/namelesserlx)
