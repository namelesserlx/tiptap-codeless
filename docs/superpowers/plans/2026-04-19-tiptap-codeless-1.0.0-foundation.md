# Tiptap Codeless 1.0.0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the three flagship extensions and their examples into a coherent, production-grade 1.0.0 foundation with consistent APIs, predictable runtime behavior, stronger performance characteristics, and release-quality test coverage.

**Architecture:** Build a shared foundation layer for option normalization, i18n, portal/layer management, async lifecycle cleanup, and test harnesses, then rewrite `code-block-pro`, `drag-handle`, and `file-upload` around smaller feature modules with explicit contracts. Treat examples as golden integrations, not demos glued together ad hoc, and make release/docs/migration work part of the product, not cleanup after the code is done.

**Tech Stack:** Tiptap v3, ProseMirror plugins, React 19, Vite, Vitest, TypeScript, dts-bundle-generator, highlight/lowlight integrations, browser DOM APIs.

---

## Official Tiptap Baselines

These are mandatory reference points for the rewrite. Any deviation from them must be intentional, documented, and tested.

- Official `CodeBlockLowlight` source:
  [packages/extension-code-block-lowlight/src/code-block-lowlight.ts](https://github.com/ueberdosis/tiptap/blob/dec97359f25684d53e577abd72c503253713fedf/packages/extension-code-block-lowlight/src/code-block-lowlight.ts)
- Official `DragHandle` source:
  [packages/extension-drag-handle/src/drag-handle.ts](https://github.com/ueberdosis/tiptap/blob/dec97359f25684d53e577abd72c503253713fedf/packages/extension-drag-handle/src/drag-handle.ts)
- Official `FileHandler` source:
  [packages/extension-file-handler/src/fileHandler.ts](https://github.com/ueberdosis/tiptap/blob/dec97359f25684d53e577abd72c503253713fedf/packages/extension-file-handler/src/fileHandler.ts)
- Official `ReactNodeViewRenderer` source:
  [packages/react/src/ReactNodeViewRenderer.tsx](https://github.com/ueberdosis/tiptap/blob/dec97359f25684d53e577abd72c503253713fedf/packages/react/src/ReactNodeViewRenderer.tsx)

### Baseline Rules

- `code-block-pro` must stay structurally compatible with the official `CodeBlock` / `CodeBlockLowlight` model, then add toolbar, collapse, fullscreen, lazy render, and Mermaid as layered capabilities.
- `drag-handle` must align its core option philosophy with the official drag-handle extension: a focused runtime around handle rendering, positioning, locking, and node change events. Extra features like insert menus must be built as explicit layers, not folded into the base contract.
- `file-upload` must separate file event intake from asset rendering and storage orchestration, following the official `FileHandler` idea that paste/drop handling is one concern and upload/render behavior is another.
- React NodeViews in all three packages must respect the official renderer lifecycle model: stable mount/update/destroy semantics, storage sync through the editor, and explicit update boundaries instead of ad hoc React-only state.

## Why 0.1.x Is Not 1.0.0-Ready

- Public option surfaces are inconsistent across packages and still contain legacy aliases, half-implemented knobs, and naming drift.
- Large files like `packages/extension-drag-handle/src/extension/DragHandlePlugin.ts` and `packages/extension-file-upload/src/extension/FileUploadExtension.ts` mix orchestration, DOM behavior, data flow, and compatibility logic in one place.
- Lifecycle management is ad hoc: fullscreen scroll locking, object URL ownership, delayed renderer bootstrapping, and hidden input cleanup were all previously under-specified.
- Type/export ergonomics are not strong enough for 1.0.0. External consumers should get stable commands, storage typings, and option contracts without examples having to cast or work around packaging details.
- Examples are not yet authoritative reference integrations. They still carry demo shortcuts, inline configs, and avoidable coupling.
- Test depth is still too shallow for a foundational release. We need unit, integration, DOM behavior, and build/package guarantees, plus targeted browser-level coverage for the riskiest UX paths.

## 1.0.0 Principles

- One canonical configuration shape per concept.
- No advertised option without runtime support and tests.
- Side effects must have explicit ownership and cleanup.
- Performance-sensitive work must be measurable and isolated.
- Examples must model recommended integration patterns.
- 1.0.0 APIs may break 0.x behavior when the result is simpler and more reliable, but every break needs a migration note.
- Visual style is frozen to the first public version unless a change is required to fix a bug, layering issue, accessibility issue, or responsiveness defect. Internal rewrites must preserve the established look and feel by default.
- Style implementation may be rewritten aggressively for maintainability, reuse, and performance, but rendered output must remain visually identical to the first-version baseline unless a required bug fix demands a minimal exception.

## Target File Structure

### Shared Foundation

- Create: `packages/core/src/config/normalizeUi.ts`
- Create: `packages/core/src/dom/layerManager.ts`
- Create: `packages/core/src/dom/objectLifecycle.ts`
- Create: `packages/core/src/editor/commandTypes.ts`
- Create: `packages/core/src/testing/createTestEditor.ts`
- Create: `packages/core/src/testing/renderNodeView.tsx`
- Modify: `packages/core/src/index.ts`

### Code Block Pro

- Create: `packages/extension-code-block-pro/src/config/normalizeOptions.ts`
- Create: `packages/extension-code-block-pro/src/extension/attrs.ts`
- Create: `packages/extension-code-block-pro/src/state/useCodeBlockUiState.ts`
- Create: `packages/extension-code-block-pro/src/perf/codeMetrics.ts`
- Modify: `packages/extension-code-block-pro/src/extension/CodeBlockProExtension.ts`
- Modify: `packages/extension-code-block-pro/src/components/Toolbar.tsx`
- Modify: `packages/extension-code-block-pro/src/components/CodeBlockViewFull.tsx`
- Modify: `packages/extension-code-block-pro/src/hooks/useMermaid.ts`
- Test: `packages/extension-code-block-pro/test/**/*.test.ts*`

### Drag Handle

- Create: `packages/extension-drag-handle/src/config/normalizeOptions.ts`
- Create: `packages/extension-drag-handle/src/runtime/rendererLifecycle.ts`
- Create: `packages/extension-drag-handle/src/runtime/visibility.ts`
- Create: `packages/extension-drag-handle/src/runtime/commandRange.ts`
- Modify: `packages/extension-drag-handle/src/extension/DragHandleExtension.tsx`
- Modify: `packages/extension-drag-handle/src/extension/DragHandlePlugin.ts`
- Modify: `packages/extension-drag-handle/src/components/DragHandle.tsx`
- Modify: `packages/extension-drag-handle/src/contexts/InsertMenuContext.tsx`
- Test: `packages/extension-drag-handle/test/**/*.test.ts*`

### File Upload

- Create: `packages/extension-file-upload/src/config/normalizeOptions.ts`
- Create: `packages/extension-file-upload/src/runtime/assetRegistry.ts`
- Create: `packages/extension-file-upload/src/runtime/dialogLifecycle.ts`
- Create: `packages/extension-file-upload/src/runtime/metadata.ts`
- Modify: `packages/extension-file-upload/src/extension/FileUploadExtension.ts`
- Modify: `packages/extension-file-upload/src/extension/FileUploadPlugin.ts`
- Modify: `packages/extension-file-upload/src/components/ResizableImageView.tsx`
- Modify: `packages/extension-file-upload/src/utils/uploadHandlers.ts`
- Test: `packages/extension-file-upload/test/**/*.test.ts*`

### Examples / Docs / Release

- Modify: `examples/code-block-pro/src/App.tsx`
- Modify: `examples/drag-handle/src/App.tsx`
- Modify: `examples/file-upload/src/App.tsx`
- Modify: package `README.md` files and `README.zh-CN.md`
- Create: `docs/migrations/1.0.0.md`
- Create: `.changeset/1-0-0-foundation.md`

## Task 1: Build The Shared 1.0 Foundation

**Files:**
- Create: `packages/core/src/config/normalizeUi.ts`
- Create: `packages/core/src/dom/layerManager.ts`
- Create: `packages/core/src/dom/objectLifecycle.ts`
- Create: `packages/core/src/editor/commandTypes.ts`
- Create: `packages/core/src/testing/createTestEditor.ts`
- Create: `packages/core/src/testing/renderNodeView.tsx`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/test/foundation.test.ts`

- [ ] **Step 1: Write the failing shared-contract tests**

```ts
import { describe, expect, it } from 'vitest';
import { createLayerManager, createObjectLifecycleRegistry, mergeUiConfig } from '../../src';

describe('shared foundation', () => {
  it('merges canonical ui config with deterministic precedence', () => {
    expect(
      mergeUiConfig(
        { bubbleMenu: { enabled: true, zIndex: 100 } },
        { bubbleMenu: { zIndex: 999 } }
      )
    ).toEqual({ bubbleMenu: { enabled: true, zIndex: 999 } });
  });

  it('releases tracked resources exactly once', () => {
    const released: string[] = [];
    const registry = createObjectLifecycleRegistry((id) => released.push(id));
    registry.track('a');
    registry.track('b');
    registry.releaseMissing(new Set(['b']));
    expect(released).toEqual(['a']);
  });

  it('allocates layered overlays without hard-coded package-specific z-index rules', () => {
    const layers = createLayerManager({ base: 1000 });
    expect(layers.get('toolbar')).toBe(1000);
    expect(layers.get('dropdown')).toBeGreaterThan(layers.get('toolbar'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/test/foundation.test.ts`  
Expected: FAIL because the shared foundation helpers do not exist yet.

- [ ] **Step 3: Implement the minimal shared contracts**

```ts
export function mergeUiConfig<T extends Record<string, unknown>>(...parts: Partial<T>[]): T {
  return parts.reduce((acc, part) => Object.assign(acc, part), {} as T);
}

export function createLayerManager({ base }: { base: number }) {
  const slots = new Map<string, number>();
  return {
    get(name: string) {
      if (!slots.has(name)) slots.set(name, base + slots.size * 10);
      return slots.get(name)!;
    },
  };
}
```

- [ ] **Step 4: Build shared test utilities used by all three packages**

```ts
export function createTestEditor(extensions: AnyExtension[]) {
  return new Editor({
    element: document.createElement('div'),
    extensions,
    content: '<p>test</p>',
  });
}
```

- [ ] **Step 5: Run shared tests and commit**

Run: `pnpm vitest run packages/core/test/foundation.test.ts`  
Expected: PASS

```bash
git add packages/core/src packages/core/test
git commit -m "refactor: add shared 1.0 foundation utilities"
```

## Task 2: Rewrite The Canonical Option Contracts

**Files:**
- Modify: `packages/extension-code-block-pro/src/types/index.ts`
- Modify: `packages/extension-drag-handle/src/types/index.ts`
- Modify: `packages/extension-file-upload/src/types/index.ts`
- Create: `packages/extension-code-block-pro/src/config/normalizeOptions.ts`
- Create: `packages/extension-drag-handle/src/config/normalizeOptions.ts`
- Create: `packages/extension-file-upload/src/config/normalizeOptions.ts`
- Test: `packages/**/test/*Options.test.ts`

- [ ] **Step 1: Write failing tests for canonical option normalization**

```ts
it('normalizes legacy aliases into the canonical ui contract', () => {
  expect(normalizeFileUploadOptions({
    imgBubbleMenuConfig: { enabled: false, zIndex: 2000 },
  }).ui.bubbleMenu).toEqual({ enabled: false, zIndex: 2000 });
});

it('drops unsupported drag-handle options from the public runtime shape', () => {
  const options = normalizeDragHandleOptions({ drag: { enabled: false } });
  expect(options.drag.enabled).toBe(false);
});
```

- [ ] **Step 2: Run targeted tests to verify failure**

Run: `pnpm vitest run packages/extension-code-block-pro/test packages/extension-drag-handle/test packages/extension-file-upload/test --runInBand`  
Expected: FAIL on missing normalizers and old option assumptions.

- [ ] **Step 3: Implement per-package normalizers with one public shape**

```ts
export function normalizeFileUploadOptions(options: FileUploadOptions): NormalizedFileUploadOptions {
  const bubbleMenu = options.ui?.bubbleMenu ?? options.imgBubbleMenuConfig ?? DEFAULTS.ui.bubbleMenu;
  return {
    ...DEFAULTS,
    ...options,
    ui: { ...DEFAULTS.ui, ...options.ui, bubbleMenu },
  };
}
```

- [ ] **Step 4: Replace direct option reads in runtime code with normalized access**

```ts
const normalized = normalizeDragHandleOptions(this.options);
const dragEnabled = normalized.drag.enabled;
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm test:run`  
Expected: PASS with no direct reads from deprecated aliases in runtime behavior.

```bash
git add packages/*/src/types packages/*/src/config packages/*/test
git commit -m "refactor: normalize extension option contracts for 1.0"
```

## Task 3: Rewrite Code Block Pro Around A Smaller Runtime Core

**Files:**
- Modify: `packages/extension-code-block-pro/src/extension/CodeBlockProExtension.ts`
- Create: `packages/extension-code-block-pro/src/extension/attrs.ts`
- Create: `packages/extension-code-block-pro/src/state/useCodeBlockUiState.ts`
- Create: `packages/extension-code-block-pro/src/perf/codeMetrics.ts`
- Modify: `packages/extension-code-block-pro/src/components/Toolbar.tsx`
- Modify: `packages/extension-code-block-pro/src/components/CodeBlockViewFull.tsx`
- Modify: `packages/extension-code-block-pro/src/hooks/useMermaid.ts`
- Test: `packages/extension-code-block-pro/test/*.test.ts*`

- [ ] **Step 1: Write failing tests for parse/serialize, external attr sync, and observer deduplication**

```ts
it('round-trips language ids with symbols', () => {
  const html = renderRoundTrip('<pre data-language="c++"><code class="language-c++">x</code></pre>');
  expect(html).toContain('data-language="c++"');
});

it('syncs toolbar state when attrs change externally', () => {
  const harness = renderCodeBlockHarness({ collapsed: false });
  harness.rerender({ collapsed: true });
  expect(harness.getByRole('button', { name: /expand/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run those tests to verify failure**

Run: `pnpm vitest run packages/extension-code-block-pro/test`  
Expected: FAIL before the rewrite.

- [ ] **Step 3: Extract canonical attrs and UI state helpers**

```ts
export function readCodeBlockAttrs(node: ProseMirrorNode) {
  return {
    language: node.attrs.language ?? null,
    collapsed: Boolean(node.attrs.collapsed),
    showLineNumbers: Boolean(node.attrs.showLineNumbers),
  };
}
```

- [ ] **Step 4: Consolidate DOM observation into one metrics path**

```ts
export function createCodeMetricsObserver(target: HTMLElement, onChange: (state: Metrics) => void) {
  const observer = new MutationObserver(() => onChange(readMetrics(target)));
  observer.observe(target, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}
```

- [ ] **Step 5: Re-run tests, package build, and commit**

Run:
- `pnpm vitest run packages/extension-code-block-pro/test`
- `pnpm --filter @tiptap-codeless/extension-code-block-pro build`

Expected: PASS

```bash
git add packages/extension-code-block-pro/src packages/extension-code-block-pro/test
git commit -m "refactor: rebuild code-block-pro runtime for 1.0"
```

## Task 4: Rewrite Drag Handle Around Explicit Runtime Boundaries

**Files:**
- Modify: `packages/extension-drag-handle/src/extension/DragHandleExtension.tsx`
- Modify: `packages/extension-drag-handle/src/extension/DragHandlePlugin.ts`
- Create: `packages/extension-drag-handle/src/runtime/rendererLifecycle.ts`
- Create: `packages/extension-drag-handle/src/runtime/visibility.ts`
- Create: `packages/extension-drag-handle/src/runtime/commandRange.ts`
- Modify: `packages/extension-drag-handle/src/components/DragHandle.tsx`
- Modify: `packages/extension-drag-handle/src/contexts/InsertMenuContext.tsx`
- Test: `packages/extension-drag-handle/test/*.test.ts*`

- [ ] **Step 1: Write failing tests for lifecycle, drag gating, command range, and visibility**

```ts
it('does not create a renderer after destroy', () => {
  const runtime = createRendererLifecycle(...);
  runtime.scheduleMount();
  runtime.destroy();
  expect(runtime.hasRenderer()).toBe(false);
});

it('does not install drag listeners when drag is disabled', () => {
  const plugin = createDragHandlePlugin({ options: { drag: { enabled: false } } as never, ... });
  expect(pluginDragHandlers(plugin).dragover).toBeFalsy();
});
```

- [ ] **Step 2: Run targeted tests and confirm failure**

Run: `pnpm vitest run packages/extension-drag-handle/test`  
Expected: FAIL around lifecycle and visibility behavior.

- [ ] **Step 3: Split renderer bootstrapping and plugin state management**

```ts
export function createRendererLifecycle(factory: () => ReactRenderer) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let renderer: ReactRenderer | null = null;
  return {
    scheduleMount() { timer = setTimeout(() => { renderer = factory(); }, 0); },
    destroy() { if (timer) clearTimeout(timer); renderer?.destroy(); renderer = null; },
  };
}
```

- [ ] **Step 4: Replace implicit visibility rules with a single derived visibility contract**

```ts
export function getHandleVisibility(input: VisibilityInput) {
  return input.editorEditable && input.pluginVisible && input.position?.visible && input.dragEnabled;
}
```

- [ ] **Step 5: Re-run tests, build, and commit**

Run:
- `pnpm vitest run packages/extension-drag-handle/test`
- `pnpm --filter @tiptap-codeless/extension-drag-handle build`

Expected: PASS

```bash
git add packages/extension-drag-handle/src packages/extension-drag-handle/test
git commit -m "refactor: rebuild drag-handle runtime for 1.0"
```

## Task 5: Rewrite File Upload Around Resource Ownership

**Files:**
- Modify: `packages/extension-file-upload/src/extension/FileUploadExtension.ts`
- Modify: `packages/extension-file-upload/src/extension/FileUploadPlugin.ts`
- Create: `packages/extension-file-upload/src/config/normalizeOptions.ts`
- Create: `packages/extension-file-upload/src/runtime/assetRegistry.ts`
- Create: `packages/extension-file-upload/src/runtime/dialogLifecycle.ts`
- Create: `packages/extension-file-upload/src/runtime/metadata.ts`
- Modify: `packages/extension-file-upload/src/components/ResizableImageView.tsx`
- Modify: `packages/extension-file-upload/src/utils/uploadHandlers.ts`
- Test: `packages/extension-file-upload/test/*.test.ts*`

- [ ] **Step 1: Write failing tests for object URL cleanup, file dialog cancellation, and metadata strategy**

```ts
it('revokes tracked object urls when assets leave the document', async () => {
  const revoke = vi.fn();
  const registry = createAssetRegistry({ revoke });
  registry.track({ url: 'blob:a', owned: true });
  registry.sync(new Set());
  expect(revoke).toHaveBeenCalledWith('blob:a');
});

it('cleans up abandoned file inputs after cancel', async () => {
  const dialog = createDialogLifecycle();
  dialog.open();
  dialog.handleWindowFocus();
  expect(dialog.hasOpenInput()).toBe(false);
});
```

- [ ] **Step 2: Run the file-upload tests and verify failure**

Run: `pnpm vitest run packages/extension-file-upload/test`  
Expected: FAIL before the rewrite.

- [ ] **Step 3: Implement asset ownership and deferred metadata enrichment**

```ts
export type AssetDescriptor = StoredAsset & { ownedObjectUrl?: boolean };

export function shouldProbeRemoteMetadata(asset: AssetDescriptor, options: MetadataOptions) {
  return options.probeRemote && !asset.width && !asset.height && !asset.url.startsWith('blob:');
}
```

- [ ] **Step 4: Make `ui.bubbleMenu` the only canonical runtime shape**

```ts
const bubbleMenu = normalized.ui.bubbleMenu;
return { ui: { bubbleMenu }, imgBubbleMenuConfig: bubbleMenu };
```

- [ ] **Step 5: Re-run tests, build, and commit**

Run:
- `pnpm vitest run packages/extension-file-upload/test`
- `pnpm --filter @tiptap-codeless/extension-file-upload build`

Expected: PASS

```bash
git add packages/extension-file-upload/src packages/extension-file-upload/test
git commit -m "refactor: rebuild file-upload lifecycle and config model for 1.0"
```

## Task 6: Promote Examples Into Golden Integrations

**Files:**
- Modify: `examples/code-block-pro/src/App.tsx`
- Modify: `examples/drag-handle/src/App.tsx`
- Modify: `examples/file-upload/src/App.tsx`
- Modify: `examples/**/src/styles.css`
- Test: example build commands

- [ ] **Step 1: Replace inline demo-only config with exported fixtures**

```ts
export const codeBlockProDemoConfig = {
  locale: 'zh-CN',
  ui: { languageDropdown: { zIndex: 2400 } },
};
```

- [ ] **Step 2: Gate unavailable features and model recommended consumer usage**

```ts
const { openFileDialog } = useFileUpload(editor);
const customUploadAvailable = isCosConfigured();
```

- [ ] **Step 3: Make layouts responsive and visually intentional**

```css
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
```

- [ ] **Step 4: Run example builds**

Run: `pnpm --filter "./examples/**" build`  
Expected: PASS. Warnings about large Mermaid chunks are allowed until the dedicated bundle-splitting task lands.

- [ ] **Step 5: Commit**

```bash
git add examples
git commit -m "refactor: turn examples into 1.0 golden integrations"
```

## Task 7: Release Readiness, Migration, And Packaging

**Files:**
- Modify: package `README.md` files
- Create: `docs/migrations/1.0.0.md`
- Create: `.changeset/1-0-0-foundation.md`
- Modify: `scripts/bundle-dts.mjs`
- Test: `test/bundle-dts.test.ts`

- [ ] **Step 1: Write failing declaration-bundling and migration coverage tests**

```ts
it('preserves command augmentations in bundled declarations', async () => {
  const output = await bundleDeclarations(...);
  expect(output).toContain("declare module '@tiptap/core'");
});
```

- [ ] **Step 2: Run the declaration bundling test to verify failure**

Run: `pnpm vitest run test/bundle-dts.test.ts`  
Expected: FAIL until bundling preserves augmentations.

- [ ] **Step 3: Fix bundling or packaging so consumer-facing augmentations survive**

```js
const bundles = generateDtsBundle([...], {
  preferredConfigPath: project,
  exportReferencedTypes: true,
});
```

- [ ] **Step 4: Write migration docs that explicitly call out 1.0 breaks**

```md
- `imgBubbleMenuConfig` is now compatibility-only; use `ui.bubbleMenu`.
- Unsupported `drag-handle` config fields were removed.
- `code-block-pro` attr parsing now respects symbolic language ids.
```

- [ ] **Step 5: Run final verification and commit**

Run:
- `pnpm lint`
- `pnpm test:run`
- `pnpm type-check`
- `pnpm build`
- `pnpm --filter "./examples/**" build`

Expected: PASS

```bash
git add README.md docs .changeset scripts test
git commit -m "chore: finalize 1.0 release foundation and migration docs"
```

## Success Criteria

- All three extensions share a coherent config language: `locale`, `messages`, `ui`, `behavior`, `callbacks`.
- No deprecated or unsupported option is used directly in runtime logic.
- Resource lifecycles are explicit and tested.
- Examples compile cleanly and model the recommended public API.
- Build artifacts remain small and declaration output is consumer-safe.
- Style rewrites do not produce unapproved visual drift from the first-version appearance.
- The repository is ready to tag a `1.0.0` beta or release candidate instead of another experimental patch.

## Risks To Watch

- Tiptap command/storage module augmentation may still be tricky under single-file declaration bundling.
- Mermaid/highlight-related example bundle weight is a separate performance track from package runtime quality.
- A true 1.0 cleanup will almost certainly require breaking some 0.x aliases instead of carrying them forever.
- CSS refactors can accidentally change spacing, layering, or control chrome even when behavior tests stay green, so visual regression checks are required for any style-system rewrite.

## Self-Review

- Spec coverage: This plan covers architecture, API unification, lifecycle cleanup, performance-sensitive runtime boundaries, tests, examples, packaging, and migration.
- Placeholder scan: No `TODO`/`TBD` placeholders remain. Every task names exact files and exact verification commands.
- Type consistency: The plan consistently treats `ui` as canonical, command typings as part of packaging, and shared foundation utilities as core prerequisites.

## Recommended Execution Mode

Plan complete and saved to `docs/superpowers/plans/2026-04-19-tiptap-codeless-1.0.0-foundation.md`.

Because this work spans shared foundation + three separate extension rewrites, **Subagent-Driven** execution is the recommended path. It lets us assign disjoint ownership per task, review each batch, and keep the 1.0.0 rewrite controlled instead of turning into one giant risky patch.
