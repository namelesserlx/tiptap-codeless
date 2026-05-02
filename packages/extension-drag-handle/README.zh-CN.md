# @tiptap-codeless/extension-drag-handle

Tiptap 拖拽手柄扩展：支持拖拽排序块、插入菜单。

- [English](README.md)
- [中文](README.zh-CN.md) (当前)

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
            locale: 'zh-CN',
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

## ⚙️ 配置选项

### 共享国际化配置

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

### 手柄图标自定义

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

| 选项               | 类型                                                               | 默认值                                | 描述                               |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------- | ---------------------------------- |
| `locale`           | `'zh-CN' \| 'zh-TW' \| 'en' \| 'ja'`                               | `'zh-CN'`                             | 内置 UI 语言                       |
| `messages`         | `DeepPartial<DragHandleMessages>`                                  | `{}`                                  | 覆盖内置菜单文案                   |
| `offset`           | `{ x?: number; y?: number }`                                       | `{ x: -32, y: 0 }`                    | 手柄相对块的偏移                   |
| `handle`           | `{ width?, height?, hoverDelay?, hideDelay?, zIndex?, iconSize?, icons? }` | `{ width: 24, height: 24, ... }` | 手柄尺寸、延迟和自定义图标         |
| `insertMenu`       | `InsertMenuConfig`                                                 | 见下表                                | 插入菜单与斜杠触发                 |
| `drag`             | `{ enabled?: boolean; opacity?: number }`                          | `{ enabled: true, opacity: 0.5 }`     | 拖拽行为                           |
| `nodes`            | `{ include?: string[]; exclude?: string[] }`                       | `{ include: undefined, exclude: [] }` | 控制哪些节点显示手柄               |
| `events`           | `{ onDragStart?, onDragEnd?, onNodeChange?, onInsertClick? }`      | `{}`                                  | 运行时生命周期回调                 |

### 插入菜单配置

| 选项             | 类型                                    | 默认值      | 描述                                      |
| ---------------- | --------------------------------------- | ----------- | ----------------------------------------- |
| `enabled`        | `boolean`                               | `true`      | 是否启用插入菜单 UI。设为 `false` 时，空块插入按钮和斜杠触发都会关闭 |
| `trigger`        | `string \| RegExp \| false`             | `'/'`       | 触发文本（如 `'/'`）或正则。设为 `false` 时，仅关闭斜杠触发，保留插入按钮 |
| `items`          | `(InsertMenuItem \| InsertMenuGroup)[]` | -           | 菜单项或分组                              |
| `strategy`       | `'replace' \| 'merge'`                  | `'replace'` | replace：仅用你的项；merge：与默认合并    |
| `component`      | `ComponentType<InsertMenuProps>`        | -           | 自定义菜单组件                            |
| `placement`      | `'right' \| 'left' \| 'bottom' \| 'top'` | `'left'`   | 菜单优先位置                              |
| `offset`         | `{ x?: number; y?: number }`            | `{ x: 0, y: 0 }` | 菜单附加偏移量                        |
| `zIndex`         | `number`                                | `1000`      | 菜单层级                                  |

---

## 🔒 只读模式

`DragHandle` 跟随 Tiptap 编辑器级别的只读状态，不需要在扩展里额外配置 `readonly` 选项。

```tsx
const editor = useEditor({
    editable: false,
    extensions: [StarterKit, DragHandle],
});

// 运行时切换
editor?.setEditable(false);
editor?.setEditable(true);
```

编辑器处于只读状态时：

- 拖拽手柄会隐藏或禁用，不允许拖拽排序块。
- 拖拽 / 放置处理会 no-op / 返回 `false`。
- 斜杠触发的插入菜单和插入手柄动作会禁用，因为它们会修改文档。
- `lockDragHandle`、`unlockDragHandle`、`hideDragHandle` 等联动命令仍可安全调用，它们只影响手柄 UI 状态。

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
        strategy: 'merge', // 与默认菜单项合并
        items: customItems,
        placement: 'right',
    },
});
```

---

## ⚙️ 配置总览

所有配置选项均由 `DragHandleOptions` 类型约束。示例：

```ts
DragHandle.configure({
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
