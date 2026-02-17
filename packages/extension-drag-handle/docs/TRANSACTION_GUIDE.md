# ProseMirror 事务（Transaction）详解

## 什么是事务（Transaction）？

**事务（Transaction）** 是 ProseMirror 中表示文档状态变化的对象。它类似于数据库中的事务概念：

- **原子性**：一个事务代表一次完整的状态变化
- **可撤销**：事务可以被撤销（undo）
- **可重做**：事务可以被重做（redo）
- **元数据**：可以携带额外的元数据（meta）用于插件间通信

### 事务的生命周期

```
创建事务 → 修改文档 → 设置元数据 → 分发（dispatch）→ 应用状态 → 触发更新
```

## 从哪些地方可以获得事务？

### 1. 从 EditorView 的 state 创建新事务

```typescript
// 最常见的方式：从当前状态创建新事务
const tr = view.state.tr;

// 或者从 editor 获取
const tr = editor.view.state.tr;
```

**示例**（来自 `DragHandlePlugin.ts`）：

```typescript
// 在 handleTextInput 中创建事务
const tr = view.state.tr.insertText(text, from, to);
tr.setMeta('openInsertMenu', { triggerRect, commandRange, triggerText: text });
view.dispatch(tr);
```

### 2. 在插件的 `apply` 方法中接收事务

```typescript
// 在插件的 state.apply 中，tr 参数就是事务
apply(tr) {
    // tr 是传入的事务对象
    const meta = tr.getMeta('lockDragHandle');
    // ...
}
```

**示例**（来自 `DragHandlePlugin.ts` 第 186 行）：

```typescript
apply(tr) {
    // 从事务中获取元数据
    const lockMeta = tr.getMeta('lockDragHandle');
    if (lockMeta !== undefined) {
        updateState({ locked: lockMeta });
    }
    // ...
}
```

### 3. 在命令（Command）中接收事务

```typescript
// Tiptap 命令的签名
addCommands() {
    return {
        lockDragHandle: () => ({ tr, dispatch }) => {
            // tr 是传入的事务对象
            if (dispatch) {
                tr.setMeta('lockDragHandle', true);
            }
            return true;
        }
    };
}
```

**示例**（来自 `DragHandleExtension.tsx` 第 129 行）：

```typescript
lockDragHandle: () =>
    ({ tr, dispatch }) => {
        if (dispatch) {
            tr.setMeta('lockDragHandle', true);
        }
        return true;
    };
```

### 4. 监听事务事件

```typescript
// 监听所有事务
editor.on('transaction', ({ transaction }) => {
    // transaction 就是事务对象
    const meta = transaction.getMeta('openInsertMenu');
});
```

**示例**（来自 `DragHandleContainer.tsx` 第 168 行）：

```typescript
const handleTransaction = ({ transaction }: { transaction: any }) => {
    const meta = transaction?.getMeta?.('openInsertMenu');
    const rect = meta?.triggerRect as DOMRect | undefined;
    if (rect) {
        openMenuAtRect(rect);
    }
};

editor.on('transaction', handleTransaction);
```

## 事务的常用方法

### 文档修改方法

#### 1. `insertText(text, from?, to?)` - 插入文本

```typescript
// 在指定位置插入文本
const tr = view.state.tr.insertText('Hello', 5);
// 替换文本（删除 from 到 to，然后插入 text）
const tr = view.state.tr.insertText('World', 5, 10);
```

**示例**（来自 `DragHandlePlugin.ts` 第 317 行）：

```typescript
const tr = view.state.tr.insertText(text, from, to);
tr.setMeta('updateInsertMenuCommandRange', {
    commandRange: {
        from: existingRange.from,
        to: existingRange.to + text.length,
    },
});
view.dispatch(tr);
```

#### 2. `delete(from, to)` - 删除内容

```typescript
// 删除指定范围的内容
const tr = view.state.tr.delete(5, 10);
```

**示例**（来自 `InsertMenu.tsx` 第 215 行）：

```typescript
// 删除命令文本（如 "/"）
if (commandRange && commandRange.to > commandRange.from) {
    const tr = view.state.tr.delete(commandRange.from, commandRange.to);
    // ...
}
```

#### 3. `insert(pos, content)` - 插入节点

```typescript
// 在指定位置插入节点或片段
const tr = view.state.tr.insert(pos, node);
const tr = view.state.tr.insert(pos, fragment);
```

**示例**（来自 `drag.ts` 第 179 行）：

```typescript
const insertPos = dropPoint(tr.doc, rawDropPos, sliceToInsert) ?? rawDropPos;
tr = tr.insert(insertPos, sliceToInsert.content);
```

#### 4. `replace(from, to, slice?)` - 替换内容

```typescript
// 替换指定范围的内容
const tr = view.state.tr.replace(from, to, slice);
```

### 选区操作方法

#### 5. `setSelection(selection)` - 设置选区

```typescript
import { Selection, TextSelection, NodeSelection } from '@tiptap/pm/state';

// 设置文本选区
const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to));

// 设置节点选区
const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
```

**示例**（来自 `DragHandle.tsx` 第 96 行）：

```typescript
// 设置选区到节点开始位置
const tr = view.state.tr.setSelection(Selection.near(view.state.doc.resolve(pos + 1)));
view.dispatch(tr);
```

#### 6. `setSelection(Selection.near($pos))` - 在位置附近设置选区

```typescript
const $pos = view.state.doc.resolve(pos);
const tr = view.state.tr.setSelection(Selection.near($pos));
```

### 元数据方法（插件间通信）

#### 7. `setMeta(key, value)` - 设置元数据

```typescript
// 设置元数据，用于插件间通信
tr.setMeta('lockDragHandle', true);
tr.setMeta('openInsertMenu', { triggerRect, commandRange });
```

**示例**（来自 `DragHandlePlugin.ts` 第 361 行）：

```typescript
const tr = view.state.tr.insertText(text, from, to);
tr.setMeta('openInsertMenu', {
    triggerRect,
    commandRange,
    triggerText: text,
});
view.dispatch(tr);
```

#### 8. `getMeta(key)` - 获取元数据

```typescript
// 在插件的 apply 方法中获取元数据
const lockMeta = tr.getMeta('lockDragHandle');
const menuMeta = tr.getMeta('openInsertMenu');
```

**示例**（来自 `DragHandlePlugin.ts` 第 199 行）：

```typescript
apply(tr) {
    const lockMeta = tr.getMeta('lockDragHandle');
    if (lockMeta !== undefined) {
        updateState({ locked: lockMeta });
    }
    // ...
}
```

### 文档映射方法

#### 9. `mapping` - 位置映射

当事务修改文档后，位置会发生变化，需要使用 `mapping` 来转换位置：

```typescript
// 获取映射对象
const mapping = tr.mapping;

// 映射旧位置到新位置
const newPos = tr.mapping.map(oldPos);

// 映射范围
const newFrom = tr.mapping.map(range.from);
const newTo = tr.mapping.map(range.to);
```

**示例**（来自 `DragHandlePlugin.ts` 第 236 行）：

```typescript
// 文档变化时更新节点位置
if (tr.docChanged && currentState.currentNode) {
    const newPos = tr.mapping.map(currentState.currentNode.pos);
    if (newPos !== currentState.currentNode.pos) {
        // 位置改变了，需要更新
        const nodeInfo = getNodeInfoFromPos(view, newPos);
        if (nodeInfo) {
            updateState({ currentNode: nodeInfo });
        }
    }
}
```

### 状态检查方法

#### 10. `docChanged` - 检查文档是否改变

```typescript
// 检查事务是否修改了文档
if (tr.docChanged) {
    // 文档已改变
}
```

**示例**（来自 `DragHandlePlugin.ts` 第 235 行）：

```typescript
// 文档变化时更新节点位置
if (tr.docChanged && currentState.currentNode) {
    // ...
}
```

#### 11. `steps` - 获取步骤列表

```typescript
// 获取事务中的所有步骤
const steps = tr.steps;
```

#### 12. `scrolledIntoView` - 标记需要滚动到视图

```typescript
// 标记事务后需要滚动到视图
const tr = view.state.tr.insertText('text', pos).scrollIntoView();
```

**示例**（来自 `drag.ts` 第 182 行）：

```typescript
view.dispatch(tr.scrollIntoView());
```

### 其他实用方法

#### 13. `setTime(time)` - 设置时间戳

```typescript
// 设置事务的时间戳（用于历史记录）
tr.setTime(Date.now());
```

#### 14. `setStoredMarks(marks)` - 设置存储的标记

```typescript
// 设置存储的格式标记（如粗体、斜体等）
tr.setStoredMarks([schema.marks.bold.create()]);
```

## 事务的完整工作流程

### 示例：完整的拖拽手柄锁定流程

```typescript
// 1. 创建事务（从状态创建）
const tr = editor.view.state.tr;

// 2. 设置元数据（插件间通信）
tr.setMeta('lockDragHandle', true);

// 3. 分发事务（应用变更）
editor.view.dispatch(tr);

// 4. 事务被应用到所有插件
// 在 DragHandlePlugin 的 apply 方法中：
apply(tr) {
    const lockMeta = tr.getMeta('lockDragHandle');
    if (lockMeta !== undefined) {
        updateState({ locked: lockMeta });
    }
    return currentState;
}

// 5. 触发 transaction 事件
editor.emit('transaction', { transaction: tr });

// 6. React 组件监听事件并更新
editor.on('transaction', () => {
    const pluginState = dragHandlePluginKey.getState(editor.state);
    setState(pluginState);
});
```

## 事务的元数据（Meta）系统

元数据是插件间通信的重要机制：

### 设置元数据

```typescript
// 在创建事务时设置
tr.setMeta('key', value);

// 值可以是任何类型
tr.setMeta('lockDragHandle', true);
tr.setMeta('openInsertMenu', { triggerRect, commandRange });
```

### 获取元数据

```typescript
// 在插件的 apply 方法中获取
const value = tr.getMeta('key');

// 检查是否存在
const lockMeta = tr.getMeta('lockDragHandle');
if (lockMeta !== undefined) {
    // 处理锁定逻辑
}
```

### 本插件中使用的元数据键

| 元数据键                       | 类型      | 用途              |
| ------------------------------ | --------- | ----------------- |
| `lockDragHandle`               | `boolean` | 锁定/解锁拖拽手柄 |
| `hideDragHandle`               | `boolean` | 隐藏拖拽手柄      |
| `cancelDragHandleHide`         | `boolean` | 取消已安排的隐藏  |
| `scheduleDragHandleHide`       | `boolean` | 安排隐藏          |
| `dragHandleDragging`           | `boolean` | 拖拽状态          |
| `openInsertMenu`               | `object`  | 打开插入菜单      |
| `updateInsertMenuCommandRange` | `object`  | 更新命令范围      |
| `clearInsertMenuCommandRange`  | `boolean` | 清理命令范围      |

## 注意事项

1. **事务是不可变的**：每次修改都会返回新的事务对象

    ```typescript
    const tr1 = view.state.tr;
    const tr2 = tr1.insertText('text', 5);
    // tr1 没有被修改，tr2 是新的事务
    ```

2. **必须 dispatch 才能生效**：创建和修改事务后，必须调用 `dispatch` 才能应用

    ```typescript
    const tr = view.state.tr.insertText('text', 5);
    view.dispatch(tr); // 必须调用才能生效
    ```

3. **在命令中检查 dispatch**：如果命令返回 `false` 或 `dispatch` 为 `null`，不要修改事务

    ```typescript
    command: () =>
        ({ tr, dispatch }) => {
            if (dispatch) {
                tr.setMeta('key', value);
            }
            return true;
        };
    ```

4. **位置映射**：文档修改后，旧位置需要映射到新位置
    ```typescript
    const oldPos = 10;
    const tr = view.state.tr.insertText('text', 5);
    const newPos = tr.mapping.map(oldPos); // 位置已改变
    ```

## 总结

事务是 ProseMirror 状态管理的核心：

- **创建**：从 `view.state.tr` 或 `editor.view.state.tr` 创建
- **修改**：使用各种方法修改文档和设置元数据
- **分发**：通过 `view.dispatch(tr)` 应用变更
- **监听**：通过 `editor.on('transaction')` 监听事务事件
- **元数据**：使用 `setMeta`/`getMeta` 进行插件间通信

事务系统使得 ProseMirror 能够：

- 实现撤销/重做功能
- 支持插件间通信
- 追踪文档变化
- 优化性能（批量更新）
