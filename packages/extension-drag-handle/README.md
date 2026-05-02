# @tiptap-codeless/extension-drag-handle

Drag handle extension for Tiptap: drag to reorder blocks, insert menu.

- [English](README.md) (Current)
- [中文](https://github.com/namelesserlx/tiptap-codeless/blob/main/packages/extension-drag-handle/README.zh-CN.md)
- [繁體中文](../../README.zh-TW.md)
- [日本語](../../README.ja.md)

---

## ✨ Features

- 🎯 **Drag handle** – Hover on block left to show handle, drag to reorder blocks
- ➕ **Insert handle** – Empty block shows insert button to open insert menu
- ⌨️ **Slash commands** – Type `/` (or custom trigger) to open insert menu for quick block insertion
- 📋 **Customizable insert menu** – Replace or merge default items (headings, lists, quote, code block, etc.)
- 🔧 **Commands** – `lockDragHandle`, `unlockDragHandle`, `hideDragHandle` for integration with menus/popovers
- 🌓 **Theme** – Built-in light/dark styles via CSS variables

---

## 📦 Installation

```bash
pnpm add @tiptap-codeless/extension-drag-handle
```

This package is **ESM-only** and targets modern React + bundler setups.

Styles are **automatically injected** by the extension; you don't need to import any CSS manually.

---

## 🚀 Basic Usage

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap-codeless/extension-drag-handle';

const editor = useEditor({
    extensions: [
        StarterKit,
        DragHandle.configure({
            locale: 'en',
            insertMenu: { enabled: true, trigger: '/' },
            drag: { enabled: true },
        }),
    ],
});

function App() {
    return <EditorContent editor={editor} />;
}
```

---

## ⚙️ Configuration Options

### Shared i18n options

```ts
DragHandle.configure({
    locale: 'ja',
    messages: {
        insertMenu: {
            groups: {
                basic: '基本',
            },
        },
    },
    insertMenu: {
        zIndex: 2400,
    },
});
```

### Handle icon customization

```tsx
DragHandle.configure({
    handle: {
        icons: {
            insert: <PlusCircleIcon />,
            drag: <GripVerticalIcon />,
        },
    },
});
```

| Option             | Type                                                                     | Default                               | Description                                   |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------- |
| `locale`           | `'zh-CN' \| 'zh-TW' \| 'en' \| 'ja'`                                     | `'zh-CN'`                             | Built-in UI locale                            |
| `messages`         | `DeepPartial<DragHandleMessages>`                                        | `{}`                                  | Override built-in menu labels                 |
| `offset`           | `{ x?: number; y?: number }`                                             | `{ x: -32, y: 0 }`                    | Handle position offset from block             |
| `handle`           | `{ width?, height?, hoverDelay?, hideDelay?, zIndex?, iconSize?, icons? }` | `{ width: 24, height: 24, ... }`    | Handle size, timing, and optional custom icons |
| `insertMenu`       | `InsertMenuConfig`                                                       | see below                             | Insert menu and slash trigger                 |
| `drag`             | `{ enabled?: boolean; opacity?: number }`                                | `{ enabled: true, opacity: 0.5 }`     | Drag behavior                                 |
| `nodes`            | `{ include?: string[]; exclude?: string[] }`                             | `{ include: undefined, exclude: [] }` | Node visibility rules                         |
| `events`           | `{ onDragStart?, onDragEnd?, onNodeChange?, onInsertClick? }`            | `{}`                                  | Runtime lifecycle callbacks                   |

### Insert menu config

| Option           | Type                                    | Default     | Description                                                  |
| ---------------- | --------------------------------------- | ----------- | ------------------------------------------------------------ |
| `enabled`        | `boolean`                               | `true`      | Enable the insert menu UI. When `false`, both the insert handle and slash trigger are disabled |
| `trigger`        | `string \| RegExp \| false`             | `'/'`       | Trigger text or pattern. Use `false` to disable slash-triggered opening while keeping the insert handle |
| `items`          | `(InsertMenuItem \| InsertMenuGroup)[]` | -           | Menu items or groups                                         |
| `strategy`       | `'replace' \| 'merge'`                  | `'replace'` | `replace`: use only your items; `merge`: merge with defaults |
| `component`      | `ComponentType<InsertMenuProps>`        | -           | Custom menu component                                        |
| `placement`      | `'right' \| 'left' \| 'bottom' \| 'top'` | `'left'`    | Preferred menu placement                                     |
| `offset`         | `{ x?: number; y?: number }`            | `{ x: 0, y: 0 }` | Extra menu offset in pixels                              |
| `zIndex`         | `number`                                | `1000`      | Insert menu stacking order                                   |

---

## 🔒 Read-only Mode

`DragHandle` follows Tiptap's editor-level read-only state. You don't need a separate `readonly` option in this extension.

```tsx
const editor = useEditor({
    editable: false,
    extensions: [StarterKit, DragHandle],
});

// Toggle later
editor?.setEditable(false);
editor?.setEditable(true);
```

When the editor is read-only:

- Drag handles are hidden/disabled and block reordering is not allowed.
- Drag/drop handlers return no-op / `false`.
- Slash-triggered insert menu and insert-handle actions are disabled because they would modify the document.
- Integration commands such as `lockDragHandle`, `unlockDragHandle`, and `hideDragHandle` are safe to call; they only affect handle UI state.

---

## 💻 Commands

Once the extension is registered, you can use the following commands:

```ts
// Lock handle (e.g. when another popover is open)
editor.commands.lockDragHandle();

// Unlock
editor.commands.unlockDragHandle();

// Hide handle
editor.commands.hideDragHandle();
```

---

## 📋 Custom Insert Menu Items

You can extend or replace the default insert menu (headings, lists, quote, code block, etc.):

```tsx
import type { InsertMenuItem, InsertMenuGroup } from '@tiptap-codeless/extension-drag-handle';

const customItems: (InsertMenuItem | InsertMenuGroup)[] = [
    {
        id: 'media',
        title: 'Media',
        items: [
            {
                id: 'insertImage',
                label: 'Image',
                icon: <ImageIcon />,
                command: (editor) => editor.commands.openFileDialog({ accept: 'image/*' }),
            },
        ],
    },
];

DragHandle.configure({
    insertMenu: {
        enabled: true,
        trigger: '/',
        strategy: 'merge', // merge with default items
        items: customItems,
        placement: 'right',
    },
});
```

---

## ⚙️ Configuration Overview

All configuration options are typed via `DragHandleOptions`. Example:

```ts
DragHandle.configure({
    locale: 'en',
    offset: { x: -32, y: 0 },
    handle: {
        width: 24,
        height: 24,
        hoverDelay: 0,
        hideDelay: 100,
        icons: {},
    },
    insertMenu: {
        enabled: true,
        trigger: '/',
        placement: 'right',
        strategy: 'merge',
        items: customItems,
        zIndex: 2400,
    },
    drag: {
        enabled: true,
        opacity: 0.5,
    },
    nodes: {
        exclude: [],
    },
});
```

---

## 📦 Exports

Components, context, and utilities:

```tsx
import {
    DragHandle,
    DragHandleContainer,
    DragHandle as DragHandleComponent,
    InsertMenu,
    DragHandleProvider,
    useDragHandleContext,
    InsertMenuProvider,
    useInsertMenuContext,
    defaultInsertMenuItems,
    mergeInsertMenuItems,
    isMenuGroup,
    useDragHandle,
} from '@tiptap-codeless/extension-drag-handle';
```

Low-level plugin API:

```tsx
import {
    createDragHandlePlugin,
    dragHandlePluginKey,
    hideDragHandle,
    lockDragHandle,
    cancelHideDragHandle,
    scheduleHideDragHandle,
} from '@tiptap-codeless/extension-drag-handle';
```

---

## 📚 Related Docs

- `HANDLE_DOM_EVENTS_GUIDE.md` – DOM events and positioning
- `THROTTLE_DEBOUNCE_RAF_GUIDE.md` – Throttle/debounce/RAF usage
- `TRANSACTION_GUIDE.md` – ProseMirror transactions for drag/drop

---

## 📖 Examples

See the example project in the `examples/drag-handle` directory for a full integration with Tiptap and React.

---

## 📄 License

MIT © [namelesserlx](https://github.com/namelesserlx)
