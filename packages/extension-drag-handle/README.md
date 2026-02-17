# @tiptap-codeless/extension-drag-handle

Drag handle extension for Tiptap: drag to reorder blocks, insert menu.

- [English](README.md) (Current)
- [中文](README.zh.md)

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
            insertMenu: { enabled: true, triggerOnSlash: true },
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

| Option             | Type                                                                     | Default                               | Description                                   |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------- |
| `offset`           | `{ x?: number; y?: number }`                                             | `{ x: -32, y: 0 }`                    | Handle position offset from block             |
| `insertMenu`       | `InsertMenuConfig`                                                       | see below                             | Insert menu and slash trigger                 |
| `drag`             | `{ enabled?: boolean; dragOpacity?: number }`                            | `{ enabled: true, dragOpacity: 0.5 }` | Drag behavior                                 |
| `handleStyle`      | `{ width?, height?, hoverDelay?, hideDelay?, zIndex?, iconSize? }`       | `{ width: 24, height: 24, ... }`      | Handle size and show/hide timing              |
| `excludeNodes`     | `string[]`                                                               | `[]`                                  | Node types that do not show the handle        |
| `includeOnlyNodes` | `string[]`                                                               | `undefined`                           | If set, only these node types show the handle |
| `element`          | `{ insert?: ReactNode \| HTMLElement; drag?: ReactNode \| HTMLElement }` | -                                     | Custom handle elements                        |
| `onDragStart`      | `(info, event) => void`                                                  | -                                     | Callback when drag starts                     |
| `onDragEnd`        | `(info \| null, event) => void`                                          | -                                     | Callback when drag ends                       |
| `onNodeChange`     | `(info \| null) => void`                                                 | -                                     | Callback when current node changes            |
| `onInsertClick`    | `(info, event) => void`                                                  | -                                     | Callback when insert button is clicked        |

### Insert menu config

| Option           | Type                                    | Default     | Description                                                  |
| ---------------- | --------------------------------------- | ----------- | ------------------------------------------------------------ |
| `enabled`        | `boolean`                               | `true`      | Enable insert menu                                           |
| `triggerOnInput` | `boolean`                               | -           | Open menu on input (e.g. when block is empty)                |
| `trigger`        | `string \| RegExp`                      | -           | Trigger text (e.g. `'/'`) or pattern                         |
| `triggerOnSlash` | `boolean`                               | `true`      | Deprecated: use `triggerOnInput` + `trigger`                 |
| `items`          | `(InsertMenuItem \| InsertMenuGroup)[]` | -           | Menu items or groups                                         |
| `itemsMode`      | `'replace' \| 'merge'`                  | `'replace'` | `replace`: use only your items; `merge`: merge with defaults |
| `custom`         | `ComponentType<InsertMenuProps>`        | -           | Custom menu component                                        |
| `position`       | `{ placement?; offset? }`               | -           | Menu placement: `right` \| `left` \| `bottom` \| `top`       |

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
        triggerOnInput: true,
        itemsMode: 'merge', // merge with default items
        items: customItems,
        position: { placement: 'right' },
    },
});
```

---

## ⚙️ Configuration Overview

All configuration options are typed via `DragHandleOptions`. Example:

```ts
DragHandle.configure({
    offset: { x: -32, y: 0 },
    insertMenu: {
        enabled: true,
        triggerOnInput: true,
        trigger: '/',
        position: { placement: 'right' },
        itemsMode: 'merge',
        items: customItems,
    },
    drag: {
        enabled: true,
        dragOpacity: 0.5,
    },
    handleStyle: {
        width: 24,
        height: 24,
        hoverDelay: 50,
        hideDelay: 100,
    },
    excludeNodes: [],
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
