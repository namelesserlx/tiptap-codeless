# Tiptap Codeless 1.0 API Rewrite Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 0.x public option surfaces for `code-block-pro`, `drag-handle`, and `file-upload` with smaller, clearer 1.0 contracts that no longer carry deprecated compatibility shapes.

**Architecture:** Keep the runtime improvements from the earlier 1.0 foundation work, but remove public configuration duplication and historical aliases. Each extension gets one canonical option shape, one normalizer, updated examples, and migration notes that describe only the new contract.

**Tech Stack:** Tiptap v3, ProseMirror, React 19, TypeScript, Vitest, Playwright, Vite.

---

## Canonical 1.0 Contracts

- `code-block-pro`
  - Keep Tiptap-aligned `lowlight` and `defaultLanguage`
  - Rename `macosControls` to `windowControls`
  - Rename `toolbar.showLanguageSelector/showCopyButton/showLineNumbersToggle` to `toolbar.language/copy/lineNumbers`
  - Rename `lineNumbers.startLine/toggleable` to `lineNumbers.start/allowToggle`
  - Rename `collapse.collapsedLines` to `collapse.visibleLines`
  - Rename `lazyRender` to `rendering`
  - Rename `ui.languageDropdown.zIndex` to `ui.layers.languageDropdown`
  - Remove `className`; consumers must use `HTMLAttributes.class`

- `drag-handle`
  - Remove `element`, `handleStyle`, and `ui.menu`
  - Canonicalize around `handle`, `drag`, `insertMenu`, `nodes`, and `events`
  - Rename `drag.dragOpacity` to `drag.opacity`
  - Rename `insertMenu.itemsMode` to `insertMenu.strategy`
  - Flatten `insertMenu.position` into `insertMenu.placement` and `insertMenu.offset`
  - Replace `triggerOnInput` / `triggerOnSlash` with `insertMenu.trigger`, where `false` disables text-triggered opening
  - Replace `excludeNodes/includeOnlyNodes` with `nodes.exclude/nodes.include`

- `file-upload`
  - Remove `storageMode`, `localStorageOptions`, `upload`, `accept`, `multiple`, `handlePaste`, `handleDrop`, `allowedMimeTypes`, `maxFileSize`, and `imgBubbleMenuConfig`
  - Canonicalize around `storage`, `picker`, `ingest`, and `ui.bubbleMenu`
  - `storage` owns mode-specific concerns such as local directory reuse and custom upload handlers
  - `picker` owns dialog selection behavior
  - `ingest` owns paste/drop/file filtering behavior

## Execution Checklist

- [ ] Rewrite the option tests first so they assert only the new 1.0 shapes
- [ ] Replace type definitions and normalizers for all three extensions
- [ ] Refactor runtime reads to use only canonical normalized options
- [ ] Update examples to the new public contracts
- [ ] Rewrite migration notes to describe breaking 1.0-only APIs
- [ ] Run `pnpm test:run`, `pnpm test:e2e`, `pnpm lint`, and `pnpm type-check`
