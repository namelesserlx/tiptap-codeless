# Project Context / 项目上下文

Tiptap Codeless is a monorepo of React + TypeScript extensions for Tiptap v3.

```
tiptap-codeless/
├── packages/
│   ├── core/                             # Shared utilities (mergeUiConfig, layerManager, test harness)
│   ├── extension-code-block-pro/         # Code block with syntax highlight, mermaid, fullscreen
│   ├── extension-drag-handle/            # Drag handle with slash-menu insert panel
│   └── extension-file-upload/            # File/image/video upload with bubble menu
├── examples/                             # Per-extension standalone demo apps
├── docs/
│   └── migrations/                       # Per-version migration guides
├── e2e/                                  # Playwright end-to-end tests
├── scripts/                              # Build tooling (bundle-dts.mjs, etc.)
└── .changeset/                           # Changesets for versioning and changelogs
```

Each extension follows the same internal structure:

```
extension-*/src/
├── config/normalizeOptions.ts            # Defaults + normalize(partial) → full typed config
├── components/                           # React NodeView components
├── contexts/                             # React context providers
├── extension/                            # Tiptap Extension + ProseMirror Plugin definitions
├── hooks/                                # Custom hooks (useCodeBlock, useDragHandle, etc.)
├── runtime/                              # Non-React runtime logic (adapters, pipelines, state)
├── types/index.ts                        # Public type definitions
├── i18n.ts                               # Message type + locale bundles
├── styles/                               # CSS modules
└── index.ts                              # Public exports
test/                                     # Vitest unit tests
```

# Key Patterns / 关键模式

## Option normalization / 选项规范化

Every extension uses a consistent pattern:

```ts
// config/normalizeOptions.ts
export const defaultOptions: XxxOptions = {...};
export function normalizeXxxOptions(partial: XxxOptions): NormalizedXxxOptions { ... }
```

The normalizer spreads defaults with user options, deep-merges nested UI config
via `mergeUiConfig()`, and fills every field so runtime code never sees `undefined`.
Runtime code only reads from `normalize(options)`, never from raw options.

## Reactive isEditable / 响应式编辑状态

ProseMirror's `setEditable()` does NOT trigger NodeView re-renders.
All NodeView components must use `useSyncExternalStore` to subscribe to the
editor's `'update'` event and re-render when `isEditable` changes:

```tsx
const isEditable = useSyncExternalStore(
  (callback) => {
    if (!editor || typeof editor.on !== 'function') return () => {};
    editor.on('update', callback);
    return () => editor.off('update', callback);
  },
  () => editor?.isEditable ?? true,
);
```

## Test conventions / 测试约定

- Unit tests: Vitest, in `test/` directories at the extension or core level
- E2E tests: Playwright, in `e2e/`
- `@tiptap-codeless/core` exports `createTestEditor()` for minimal editor harnesses
- Mock `editor.on` / `editor.off` where needed; guard with `typeof editor.on !== 'function'`

## NodeView rendering / NodeView 渲染

- Tiptap NodeViews render React components via `ReactNodeViewRenderer`
- Components receive `editor`, `node`, `selected`, `updateAttributes`, `deleteNode`, `getPos`
- Wrap with `<NodeViewWrapper>` from `@tiptap/react`
- Use React context (not prop drilling) for shared state within a NodeView

# Commands / 常用命令

```bash
pnpm dev             # Watch-mode build for all extension packages
pnpm build           # Production build (all packages)
pnpm test:run        # Run unit tests (Vitest)
pnpm test:e2e        # Build + run Playwright E2E tests
pnpm type-check      # TypeScript compilation check (all packages)
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm prepush         # format + lint + type-check + build (run before committing)

# Release
pnpm changeset       # Create a new changeset
pnpm version-packages  # Consume changesets → bump versions + generate CHANGELOGs
pnpm release         # Build + publish to npm
```

# Rules / 规则

1. Never add new public option names that duplicate or alias existing ones.
2. Always normalize options before reading them at runtime.
3. All NodeView components must react to `isEditable` changes (use the
   `useSyncExternalStore` pattern above).
4. UI text must come from `messages` (never hardcoded), with fallback to built-in
   i18n bundles for zh-CN, zh-TW, en, ja.
5. Tests go in `test/` directories, separate from `src/`.
6. Changes to public options require updating `docs/migrations/` and a changeset file.

# 1.0 Breaking Renames

When writing code or answering user questions, know the 0.x → 1.0 rename map:

| Extension | 0.x | 1.0 |
|-----------|-----|-----|
| code-block | `macosControls` | `windowControls` |
| | `toolbar.show*` | `toolbar.language/copy/lineNumbers` |
| | `lineNumbers.startLine/toggleable` | `lineNumbers.start/allowToggle` |
| | `collapse.collapsedLines` | `collapse.visibleLines` |
| | `lazyRender` | `rendering` |
| | `ui.languageDropdown.zIndex` | `ui.layers.languageDropdown` |
| | `className` | `HTMLAttributes.class` |
| drag-handle | `element` / `handleStyle` | `handle` |
| | `drag.dragOpacity` | `drag.opacity` |
| | `insertMenu.itemsMode` | `insertMenu.strategy` |
| | `insertMenu.position` | `insertMenu.placement + offset` |
| | `ui.menu` | `insertMenu.component` |
| | `triggerOnSlash/triggerOnInput` | `insertMenu.trigger` |
| | `includeOnlyNodes/excludeNodes` | `nodes.include/exclude` |
| file-upload | `storageMode/localStorageOptions/upload` | `storage` |
| | `accept/multiple` | `picker` |
| | `handlePaste/handleDrop/etc.` | `ingest` |
| | `imgBubbleMenuConfig` | `ui.bubbleMenu` |
