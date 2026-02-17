# @tiptap-codeless/core

> Core utilities for Tiptap Codeless extensions

## 📦 Installation

```bash
pnpm add @tiptap-codeless/core
```

## 🚀 Features

- **Clipboard Utilities**: `copyToClipboard`, `extractTextFromElement`
- **Style Injection**: `injectStyles` for runtime CSS injection
- **React Hooks**: `useClickOutside` for click-outside detection

## 📚 Usage

### Clipboard

```typescript
import { copyToClipboard, extractTextFromElement } from '@tiptap-codeless/core';

// Copy text to clipboard
await copyToClipboard('Hello, World!');

// Extract text from DOM element
const text = extractTextFromElement(element, ['.code-content', 'pre']);
```

### Style Injection

```typescript
import css from './styles.css?inline';
import { injectStyles } from '@tiptap-codeless/core';

injectStyles({
    id: 'my-extension-styles',
    css,
});
```

### React Hooks

```typescript
import { useClickOutside } from '@tiptap-codeless/core';

function MyComponent() {
  const ref = useClickOutside(() => console.log('Clicked outside!'));

  return <div ref={ref}>Content</div>;
}
```

## 📄 License

MIT
