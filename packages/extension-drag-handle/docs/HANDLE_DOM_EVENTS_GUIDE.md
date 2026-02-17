# handleDOMEvents 返回值详解

## 返回值的作用

在 ProseMirror 插件中，`handleDOMEvents` 的返回值控制**事件是否被"消费"（handled）**：

- **返回 `true`**：表示事件已被插件处理，**阻止** ProseMirror 的默认处理和其他插件继续处理
- **返回 `false`**：表示事件未被处理，**允许** ProseMirror 和其他插件继续处理该事件

## 核心概念

### 事件处理链

```
DOM 事件发生
    ↓
handleDOMEvents (插件1) → 返回 false → 继续
    ↓
handleDOMEvents (插件2) → 返回 true → 停止（事件被消费）
    ↓
ProseMirror 默认处理（不会执行）
```

### 返回值含义对比

| 返回值  | 含义       | 效果                           |
| ------- | ---------- | ------------------------------ |
| `true`  | 事件已处理 | 阻止默认行为，阻止其他插件处理 |
| `false` | 事件未处理 | 允许默认行为，允许其他插件处理 |

## 代码中的实际应用

### 1. mousemove 事件 - 返回 `false`

```typescript
mousemove(view, event) {
    if (rafId) {
        return false;  // 如果已有 RAF 请求，不处理，让其他插件处理
    }

    rafId = requestAnimationFrame(() => {
        rafId = null;
        handleMouseMove(view, event.clientX, event.clientY);
    });

    return false;  // 不阻止默认行为，允许其他插件也处理鼠标移动
}
```

**为什么返回 `false`？**

- 鼠标移动事件很频繁，我们只是**监听**它来更新手柄位置
- 我们**不想阻止** ProseMirror 的默认鼠标行为（如文本选择、光标移动等）
- 允许其他插件也处理鼠标移动事件

### 2. mouseleave 事件 - 返回 `false`

```typescript
mouseleave(view, event) {
    if (currentState.locked || currentState.isDragging) {
        return false;  // 锁定或拖拽中，不处理
    }

    // 各种检查...
    if (isInSafeZone(event.clientX, event.clientY)) {
        return false;  // 在安全区域内，不处理
    }

    // ... 更多检查

    scheduleHide();
    return false;  // 不阻止默认行为
}
```

**为什么返回 `false`？**

- 我们只是**监听**鼠标离开来隐藏手柄
- 不阻止 ProseMirror 的默认鼠标离开行为
- 允许其他插件也响应鼠标离开

### 3. keydown 事件 - 返回 `false`

```typescript
keydown(view) {
    if (currentState.locked) {
        return false;  // 锁定状态，不处理
    }

    // 键盘输入时隐藏手柄
    if (view.hasFocus()) {
        hide();
    }

    return false;  // 不阻止键盘输入，允许正常编辑
}
```

**为什么返回 `false`？**

- 我们只是**监听**键盘输入来隐藏手柄
- **必须允许**键盘输入正常工作，否则用户无法输入文字
- 如果返回 `true`，会阻止所有键盘输入！

### 4. dragstart/dragend 事件 - 返回 `false`

```typescript
dragstart() {
    updateState({ isDragging: true });
    return false;  // 不阻止默认拖拽行为
}

dragend() {
    updateState({ isDragging: false });
    return false;  // 不阻止默认拖拽结束行为
}
```

**为什么返回 `false`？**

- 我们只是**更新状态**，标记正在拖拽
- 不阻止 ProseMirror 的默认拖拽处理
- 允许拖拽正常进行

### 5. drop 事件 - 返回 `handled`（可能为 `true` 或 `false`）

```typescript
drop(_view, event) {
    updateState({ isDragging: false });
    // 调用 handleDrop 处理拖拽放置
    const handled = handleDrop(editor, event, null);
    return handled;  // 根据是否处理成功返回
}
```

**为什么返回 `handled`？**

让我们看看 `handleDrop` 函数的返回值逻辑：

```typescript
export function handleDrop(editor: Editor, event: DragEvent, slice: Slice | null): boolean {
    // 检查是否是我们的拖拽
    const isDragHandle = event.dataTransfer?.getData(DRAG_HANDLE_MIME);
    if (!isDragHandle) {
        return false; // 不是我们的拖拽，不处理
    }

    if (!editor.isEditable) {
        return true; // 不可编辑，阻止默认行为（防止浏览器默认拖拽）
    }

    // ... 处理拖拽逻辑 ...

    // 成功处理拖拽
    event.preventDefault(); // 阻止浏览器默认行为
    view.dispatch(tr.scrollIntoView());
    return true; // 已处理，阻止其他处理
}
```

**返回值逻辑：**

| 情况             | 返回值  | 原因                     |
| ---------------- | ------- | ------------------------ |
| 不是我们的拖拽   | `false` | 让其他插件或默认行为处理 |
| 编辑器不可编辑   | `true`  | 阻止浏览器默认拖拽行为   |
| 无法获取放置位置 | `true`  | 阻止默认行为，避免错误   |
| 没有可移动的节点 | `true`  | 阻止默认行为             |
| 拖到自己身上     | `true`  | 已处理（虽然什么都没做） |
| 成功处理拖拽     | `true`  | 已处理，阻止默认行为     |

**关键点：**

- 当**成功处理**拖拽时，返回 `true` 阻止浏览器默认拖拽行为
- 当**不是我们的拖拽**时，返回 `false` 让其他处理继续

## 何时返回 `true`？

返回 `true` 的典型场景：

### 1. 完全接管事件处理

```typescript
drop(view, event) {
    // 我们完全处理了这个事件
    handleCustomDrop(event);
    event.preventDefault();
    return true;  // 阻止默认行为和其他插件处理
}
```

### 2. 阻止默认行为

```typescript
keydown(view, event) {
    // 自定义快捷键
    if (event.key === 'Escape' && shouldCloseMenu()) {
        closeMenu();
        return true;  // 阻止默认的 Escape 行为
    }
    return false;
}
```

### 3. 处理特定情况

```typescript
mousedown(view, event) {
    // 只在特定条件下处理
    if (isOurCustomElement(event.target)) {
        handleCustomClick(event);
        return true;  // 阻止默认行为
    }
    return false;  // 其他情况让默认处理
}
```

## 何时返回 `false`？

返回 `false` 的典型场景：

### 1. 只监听，不干预

```typescript
mousemove(view, event) {
    // 只更新我们的状态，不阻止默认行为
    updateCursorPosition(event);
    return false;  // 允许文本选择等默认行为
}
```

### 2. 条件不满足

```typescript
keydown(view, event) {
    if (!shouldHandle(event)) {
        return false;  // 条件不满足，不处理
    }
    // ... 处理逻辑
    return true;
}
```

### 3. 与其他插件协作

```typescript
click(view, event) {
    // 我们处理一部分，但允许其他插件也处理
    updateOurState();
    return false;  // 让其他插件继续处理
}
```

## 常见错误

### ❌ 错误 1：总是返回 `true`

```typescript
mousemove(view, event) {
    updatePosition(event);
    return true;  // ❌ 错误！这会阻止文本选择
}
```

### ❌ 错误 2：应该返回 `true` 却返回 `false`

```typescript
drop(view, event) {
    if (handleOurDrop(event)) {
        event.preventDefault();
        return false;  // ❌ 错误！应该返回 true，否则浏览器会执行默认拖拽
    }
    return false;
}
```

### ✅ 正确做法

```typescript
mousemove(view, event) {
    updatePosition(event);
    return false;  // ✅ 正确：只监听，不阻止
}

drop(view, event) {
    if (handleOurDrop(event)) {
        event.preventDefault();
        return true;  // ✅ 正确：已处理，阻止默认行为
    }
    return false;  // ✅ 正确：未处理，让其他处理
}
```

## 本插件中的返回值总结

| 事件         | 返回值    | 原因                                |
| ------------ | --------- | ----------------------------------- |
| `mousemove`  | `false`   | 只监听，不阻止默认行为              |
| `mouseleave` | `false`   | 只监听，不阻止默认行为              |
| `keydown`    | `false`   | 只监听，必须允许键盘输入            |
| `dragstart`  | `false`   | 只更新状态，不阻止拖拽              |
| `dragend`    | `false`   | 只更新状态，不阻止拖拽结束          |
| `drop`       | `handled` | 根据是否成功处理返回 `true`/`false` |

## 最佳实践

1. **默认返回 `false`**：除非你确定要阻止默认行为
2. **明确意图**：在注释中说明为什么返回 `true` 或 `false`
3. **测试交互**：确保返回 `true` 不会破坏正常的编辑功能
4. **考虑其他插件**：返回 `false` 让其他插件也有机会处理

## 总结

- **`return true`** = "我处理了这个事件，不要再处理了"
- **`return false`** = "我没处理，继续处理吧"

在拖拽手柄插件中，大部分事件都返回 `false`，因为我们只是**监听**事件来更新状态，而不是**拦截**事件。只有 `drop` 事件在成功处理时返回 `true`，因为我们确实**接管**了拖拽放置的处理。
