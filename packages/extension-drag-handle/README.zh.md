# @tiptap-codeless/extension-drag-handle

Tiptap 拖拽手柄扩展：支持拖拽排序块、插入菜单。

- [English](README.md)
- [中文](README.zh.md) (当前)

---

## ✨ 特性

- 🎯 **拖拽手柄** – 悬浮在块左侧显示手柄，拖拽可调整块顺序
- ➕ **插入手柄** – 空块显示插入按钮，点击打开插入菜单
- ⌨️ **斜杠命令** – 输入 `/`（或自定义触发符）打开插入菜单，快速插入块
- 📋 **可定制插入菜单** – 可完全替换或与默认项合并（标题、列表、引用、代码块等）
- 🔧 **命令** – `lockDragHandle`、`unlockDragHandle`、`hideDragHandle` 便于与菜单/气泡框联动
- 🌓 **主题** – 通过 CSS 变量支持亮色/暗色样式

---

## 📦 安装

```bash
pnpm add @tiptap-codeless/extension-drag-handle
```

本包是 **ESM-only**，面向现代 React + 打包工具。

样式会在扩展初始化时 **自动注入**，无需单独引入 CSS。

---

## 🚀 基本用法

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

## ⚙️ 配置选项

| 选项               | 类型                                                               | 默认值                                | 描述                               |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------- | ---------------------------------- |
| `offset`           | `{ x?: number; y?: number }`                                       | `{ x: -32, y: 0 }`                    | 手柄相对块的偏移                   |
| `insertMenu`       | `InsertMenuConfig`                                                 | 见下表                                | 插入菜单与斜杠触发                 |
| `drag`             | `{ enabled?: boolean; dragOpacity?: number }`                      | `{ enabled: true, dragOpacity: 0.5 }` | 拖拽行为                           |
| `handleStyle`      | `{ width?, height?, hoverDelay?, hideDelay?, zIndex?, iconSize? }` | `{ width: 24, height: 24, ... }`      | 手柄尺寸与显示/隐藏延迟            |
| `excludeNodes`     | `string[]`                                                         | `[]`                                  | 不显示手柄的节点类型               |
| `includeOnlyNodes` | `string[]`                                                         | `undefined`                           | 若设置，仅在这些节点类型上显示手柄 |
| `element`          | `{ insert?; drag? }`                                               | -                                     | 自定义插入/拖拽手柄元素            |
| `onDragStart`      | `(info, event) => void`                                            | -                                     | 拖拽开始回调                       |
| `onDragEnd`        | `(info \| null, event) => void`                                    | -                                     | 拖拽结束回调                       |
| `onNodeChange`     | `(info \| null) => void`                                           | -                                     | 当前节点变化回调                   |
| `onInsertClick`    | `(info, event) => void`                                            | -                                     | 点击插入按钮回调                   |

### 插入菜单配置

| 选项             | 类型                                    | 默认值      | 描述                                      |
| ---------------- | --------------------------------------- | ----------- | ----------------------------------------- |
| `enabled`        | `boolean`                               | `true`      | 是否启用插入菜单                          |
| `triggerOnInput` | `boolean`                               | -           | 是否在输入时打开（如空块时）              |
| `trigger`        | `string \| RegExp`                      | -           | 触发文本（如 `'/'`）或正则                |
| `triggerOnSlash` | `boolean`                               | `true`      | 已废弃：请用 `triggerOnInput` + `trigger` |
| `items`          | `(InsertMenuItem \| InsertMenuGroup)[]` | -           | 菜单项或分组                              |
| `itemsMode`      | `'replace' \| 'merge'`                  | `'replace'` | replace：仅用你的项；merge：与默认合并    |
| `custom`         | `ComponentType<InsertMenuProps>`        | -           | 自定义菜单组件                            |
| `position`       | `{ placement?; offset? }`               | -           | 菜单位置：right \| left \| bottom \| top  |

---

## 💻 可用命令

注册扩展后，你可以使用以下命令：

```ts
// 锁定手柄（例如其他气泡框打开时）
editor.commands.lockDragHandle();

// 解锁
editor.commands.unlockDragHandle();

// 隐藏手柄
editor.commands.hideDragHandle();
```

---

## 📋 自定义插入菜单项

可以扩展或替换默认插入菜单（标题、列表、引用、代码块等）：

```tsx
import type { InsertMenuItem, InsertMenuGroup } from '@tiptap-codeless/extension-drag-handle';

const customItems: (InsertMenuItem | InsertMenuGroup)[] = [
    {
        id: 'media',
        title: '媒体',
        items: [
            {
                id: 'insertImage',
                label: '图片',
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
        itemsMode: 'merge', // 与默认菜单项合并
        items: customItems,
        position: { placement: 'right' },
    },
});
```

---

## ⚙️ 配置总览

所有配置选项均由 `DragHandleOptions` 类型约束。示例：

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

## 📦 导出

组件、Context 与工具：

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

底层插件 API：

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

## 📚 相关说明

- `HANDLE_DOM_EVENTS_GUIDE.md` – DOM 事件与定位
- `THROTTLE_DEBOUNCE_RAF_GUIDE.md` – 节流/防抖/RAF 使用
- `TRANSACTION_GUIDE.md` – 拖拽中的 ProseMirror Transaction

---

## 📖 示例

你可以在仓库中的 `examples/drag-handle` 目录查看完整示例（包含 React + Tiptap 集成）。

---

## 📄 许可证

MIT © [namelesserlx](https://github.com/namelesserlx)
