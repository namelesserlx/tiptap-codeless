# @tiptap-codeless/extension-file-upload

## 1.0.0

### Major Changes

- c2f0b6c: ## 1.0.0

    First stable release — a deliberate breaking rewrite to establish a smaller,
    consistent configuration contract across all three extensions.

    ### Breaking Changes

    **code-block-pro**
    - `macosControls` → `windowControls`
    - `toolbar.showLanguageSelector / showCopyButton / showLineNumbersToggle` → `toolbar.language / copy / lineNumbers`
    - `lineNumbers.startLine / toggleable` → `lineNumbers.start / allowToggle`
    - `collapse.collapsedLines` → `collapse.visibleLines`
    - `lazyRender` → `rendering`
    - `ui.languageDropdown.zIndex` → `ui.layers.languageDropdown`
    - `className` removed — use `HTMLAttributes.class` instead

    **drag-handle**
    - `element` / `handleStyle` → `handle`
    - `drag.dragOpacity` → `drag.opacity`
    - `insertMenu.itemsMode` → `insertMenu.strategy`
    - `insertMenu.position` → `insertMenu.placement` + `insertMenu.offset`
    - `triggerOnSlash` / `triggerOnInput` → `insertMenu.trigger`
    - `ui.menu` → `insertMenu.component`
    - `includeOnlyNodes / excludeNodes` → `nodes.include / nodes.exclude`

    **file-upload**
    - `storageMode / localStorageOptions / upload` → `storage`
    - `accept / multiple` → `picker`
    - `handlePaste / handleDrop / allowedMimeTypes / maxFileSize` → `ingest`
    - `imgBubbleMenuConfig` → `ui.bubbleMenu`

    ### New Features
    - Built-in i18n: `zh-CN`, `zh-TW`, `en`, `ja`
    - Unified `locale` / `messages` / `ui` configuration contract
    - Reactive `isEditable` support across all NodeViews
    - Runtime safety: mermaid concurrency serialization, blob URL lifecycle, DOM cleanup
    - Full test suites in dedicated `test/` directories

    ### Migration

    See the [1.0.0 Migration Guide](https://github.com/namelesserlx/tiptap-codeless/blob/main/docs/migrations/1.0.0.md).

### Patch Changes

- Updated dependencies [c2f0b6c]
    - @tiptap-codeless/core@1.0.0

## 0.1.1

### Patch Changes

- Update homepage to point to GitHub Pages demo

## 0.1.0

### Minor Changes

- Initial release of @tiptap-codeless/extension-file-upload

### Patch Changes

- Updated dependencies
    - @tiptap-codeless/core@0.1.0
