# 防抖、节流和 requestAnimationFrame 详解

## 一、防抖（Debounce）

### 概念

**防抖**：在事件被触发后，等待一段时间（延迟），如果在这段时间内事件再次被触发，则重新计时。只有等待时间结束后，才执行函数。

### 工作原理

```
事件触发 → 等待延迟 → 如果再次触发 → 重新计时 → 等待结束 → 执行函数
```

### 代码实现

```typescript
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        // 如果已有定时器，清除它
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // 重新设置定时器
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
```

### 时间线示例

假设延迟为 300ms，用户连续触发事件：

```
时间轴：0ms    100ms   200ms   300ms   400ms   500ms   600ms   700ms   800ms
事件：  [触发] [触发]  [触发]  [触发]  [触发]  [触发]  [触发]  [触发]  [执行]
        └─延迟300ms─┘
                    └─延迟300ms─┘
                                └─延迟300ms─┘
                                            └─延迟300ms─┘
                                                        └─延迟300ms─┘
                                                                    ↑
                                                              最终执行
```

### 适用场景

- **搜索框输入**：用户停止输入后才发送请求
- **窗口 resize**：窗口大小调整结束后才计算布局
- **按钮点击**：防止重复提交
- **表单验证**：用户停止输入后才验证

### 示例

```typescript
// 搜索框防抖
const debouncedSearch = debounce((query: string) => {
    console.log('搜索:', query);
}, 300);

input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
    // 用户快速输入 "hello" 时，只在停止输入 300ms 后执行一次
});
```

## 二、节流（Throttle）

### 概念

**节流**：在指定时间间隔内，无论事件触发多少次，函数最多只执行一次。保证函数按固定频率执行。

### 工作原理

```
事件触发 → 立即执行（或延迟执行）→ 在时间间隔内忽略后续触发 → 时间间隔结束 → 可以再次执行
```

### 代码实现（本插件中的实现）

```typescript
export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        const now = Date.now();

        // 如果距离上次调用已经超过延迟时间，立即执行
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else {
            // 否则，安排延迟执行（确保最后一次调用也会执行）
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(
                () => {
                    lastCall = Date.now();
                    fn(...args);
                },
                delay - (now - lastCall) // 剩余等待时间
            );
        }
    };
}
```

### 时间线示例

假设延迟为 100ms，用户连续触发事件：

```
时间轴：0ms    50ms   100ms   150ms   200ms   250ms   300ms
事件：  [触发] [触发] [触发]  [触发]  [触发]  [触发]  [触发]
执行：  ✓      ✗      ✓      ✗       ✓       ✗       ✓
        └─100ms─┘      └─100ms─┘      └─100ms─┘
```

### 适用场景

- **鼠标移动**：限制鼠标移动事件的处理频率
- **滚动事件**：限制滚动事件的处理频率
- **拖拽操作**：限制拖拽位置更新的频率
- **实时更新**：需要定期更新但不需要每次触发都更新

### 示例

```typescript
// 鼠标移动节流
const throttledMouseMove = throttle((x: number, y: number) => {
    console.log('鼠标位置:', x, y);
}, 100);

window.addEventListener('mousemove', (e) => {
    throttledMouseMove(e.clientX, e.clientY);
    // 鼠标快速移动时，最多每 100ms 执行一次
});
```

## 三、防抖 vs 节流对比

### 核心区别

| 特性         | 防抖（Debounce）           | 节流（Throttle）           |
| ------------ | -------------------------- | -------------------------- |
| **执行时机** | 事件停止触发后执行         | 固定时间间隔执行           |
| **执行频率** | 可能不执行（如果持续触发） | 保证定期执行               |
| **适用场景** | 等待用户完成操作           | 需要定期更新               |
| **比喻**     | 电梯等人（等人全部进入）   | 公交车发车（固定时间发车） |

### 可视化对比

**防抖（300ms）：**

```
触发: |--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
执行:                                              ✓
```

**节流（300ms）：**

```
触发: |--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
执行: ✓        ✓        ✓        ✓        ✓
```

### 选择建议

- **需要等待用户完成操作** → 使用防抖
    - 搜索框输入
    - 表单验证
    - 窗口 resize

- **需要定期更新** → 使用节流
    - 鼠标移动跟踪
    - 滚动事件
    - 拖拽位置更新

## 四、requestAnimationFrame（RAF）

### 概念

**requestAnimationFrame**：浏览器提供的 API，用于在下一次重绘之前执行回调函数。通常以 60fps（约 16.67ms）的频率执行。

### 工作原理

```
浏览器渲染循环：
1. 执行 JavaScript
2. 执行 requestAnimationFrame 回调
3. 计算样式和布局
4. 绘制到屏幕
5. 重复
```

### 特点

1. **与浏览器刷新率同步**：通常 60fps（16.67ms），高刷新率显示器可达 120fps（8.33ms）
2. **自动暂停**：标签页不可见时自动暂停，节省资源
3. **精确时机**：在浏览器重绘之前执行，保证动画流畅
4. **取消机制**：使用 `cancelAnimationFrame` 取消

### 基本用法

```typescript
let rafId: number | null = null;

function animate() {
    // 执行动画逻辑
    updatePosition();

    // 继续下一帧
    rafId = requestAnimationFrame(animate);
}

// 开始动画
rafId = requestAnimationFrame(animate);

// 取消动画
if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
}
```

### 为什么使用 RAF？

1. **性能优化**：浏览器会自动优化，不可见时暂停
2. **流畅动画**：与屏幕刷新率同步，避免卡顿
3. **避免过度渲染**：不会超过屏幕刷新率，避免无效计算

### 示例

```typescript
// 不使用 RAF（可能过度渲染）
element.addEventListener('mousemove', (e) => {
    updatePosition(e); // 可能每秒执行数百次
});

// 使用 RAF（最多 60fps）
let rafId: number | null = null;
element.addEventListener('mousemove', (e) => {
    if (rafId) return; // 如果已有 RAF 请求，忽略

    rafId = requestAnimationFrame(() => {
        rafId = null;
        updatePosition(e); // 最多每秒 60 次
    });
});
```

## 五、节流 + requestAnimationFrame 结合使用

### 代码分析

在 `DragHandlePlugin.ts` 中的实现：

```typescript
// 1. 使用节流包装处理函数（16ms ≈ 60fps）
const handleMouseMove = throttle((view: EditorView, x: number, y: number) => {
    // ... 处理鼠标移动逻辑
}, 16);

// 2. 在事件处理中使用 RAF
handleDOMEvents: {
    mousemove(view, event) {
        if (rafId) {
            return false; // 如果已有 RAF 请求，直接返回
        }

        // 使用 RAF 调度执行
        rafId = requestAnimationFrame(() => {
            rafId = null;
            handleMouseMove(view, event.clientX, event.clientY);
        });

        return false;
    }
}
```

### 双重优化机制

#### 第一层：requestAnimationFrame

```typescript
rafId = requestAnimationFrame(() => {
    rafId = null;
    handleMouseMove(view, event.clientX, event.clientY);
});
```

**作用：**

- 将执行时机推迟到浏览器下一次重绘之前
- 如果同一帧内多次触发 `mousemove`，只执行一次（通过 `rafId` 检查）
- 与浏览器刷新率同步（60fps）

**效果：**

```
mousemove 事件：|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
RAF 调度：      ✓  ✗  ✗  ✗  ✓  ✗  ✗  ✗  ✓  ✗  ✗  ✗  ✓  ✗  ✗
实际执行：      ✓              ✓              ✓              ✓
```

#### 第二层：节流（Throttle）

```typescript
const handleMouseMove = throttle((view, x, y) => {
    // ... 处理逻辑
}, 16);
```

**作用：**

- 即使 RAF 调度了执行，节流函数也会检查时间间隔
- 如果距离上次执行不足 16ms，会延迟执行或跳过
- 确保最多每 16ms 执行一次

**效果：**

```
RAF 调度：      ✓  ✗  ✗  ✓  ✗  ✗  ✓  ✗  ✗  ✓
节流检查：      ✓  ✗  ✗  ✗  ✗  ✗  ✓  ✗  ✗  ✗
最终执行：      ✓                          ✓
```

### 结合使用的优势

#### 1. **性能优化**

```typescript
// 不使用优化：可能每秒执行数百次
mousemove → 直接执行处理函数（可能 200+ 次/秒）

// 使用 RAF：最多 60 次/秒
mousemove → RAF 调度 → 最多 60 次/秒

// 使用 RAF + 节流：双重保障
mousemove → RAF 调度 → 节流检查 → 最多 60 次/秒（更稳定）
```

#### 2. **避免过度渲染**

- **RAF**：确保只在浏览器重绘前执行
- **节流**：确保即使 RAF 调度了，也不会过度执行

#### 3. **流畅的用户体验**

- **RAF**：与屏幕刷新率同步，动画流畅
- **节流**：保证定期更新，不会因为性能问题导致卡顿

### 完整执行流程

```
用户移动鼠标
    ↓
触发 mousemove 事件（可能每秒数百次）
    ↓
检查 rafId（第一层过滤）
    ├─ 如果已有 RAF 请求 → 直接返回（忽略本次事件）
    └─ 如果没有 → 继续
    ↓
使用 requestAnimationFrame 调度（最多 60fps）
    ↓
浏览器准备重绘
    ↓
执行 RAF 回调
    ↓
调用 handleMouseMove（节流函数）
    ↓
节流函数检查时间间隔（第二层过滤）
    ├─ 如果距离上次执行 < 16ms → 延迟执行或跳过
    └─ 如果距离上次执行 >= 16ms → 立即执行
    ↓
执行实际处理逻辑
    ↓
更新拖拽手柄位置
```

### 为什么需要两层优化？

#### 场景 1：只有 RAF

```typescript
// 问题：如果浏览器刷新率是 120fps，RAF 会执行 120 次/秒
// 对于复杂的节点检测逻辑，可能还是太频繁
mousemove → RAF → 执行（120 次/秒）→ 可能性能问题
```

#### 场景 2：只有节流

```typescript
// 问题：节流基于时间，可能与浏览器刷新不同步
// 可能导致动画不流畅
mousemove → 节流检查 → 执行（可能不在重绘时机）→ 可能卡顿
```

#### 场景 3：RAF + 节流（最佳）

```typescript
// 优势：
// 1. RAF 确保与浏览器刷新同步（流畅）
// 2. 节流确保不会过度执行（性能）
// 3. 双重保障，更稳定
mousemove → RAF → 节流 → 执行（最多 60 次/秒，流畅且稳定）
```

## 六、实际效果对比

### 不使用优化

```typescript
handleDOMEvents: {
    mousemove(view, event) {
        handleMouseMove(view, event.clientX, event.clientY);
        // 问题：可能每秒执行 200+ 次
        // 导致：CPU 占用高，可能卡顿
    }
}
```

**性能：**

- 执行频率：200+ 次/秒
- CPU 占用：高
- 用户体验：可能卡顿

### 只使用 RAF

```typescript
handleDOMEvents: {
    mousemove(view, event) {
        if (rafId) return false;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            handleMouseMove(view, event.clientX, event.clientY);
        });
        // 优势：最多 60 次/秒，与刷新率同步
        // 问题：如果处理逻辑复杂，可能还是太频繁
    }
}
```

**性能：**

- 执行频率：最多 60 次/秒
- CPU 占用：中等
- 用户体验：流畅

### 使用 RAF + 节流（当前实现）

```typescript
const handleMouseMove = throttle((view, x, y) => {
    // ... 复杂逻辑
}, 16);

handleDOMEvents: {
    mousemove(view, event) {
        if (rafId) return false;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            handleMouseMove(view, event.clientX, event.clientY);
        });
        // 优势：双重保障，最多 60 次/秒，更稳定
    }
}
```

**性能：**

- 执行频率：最多 60 次/秒（稳定）
- CPU 占用：低
- 用户体验：流畅且稳定

## 七、总结

### 防抖（Debounce）

- **用途**：等待用户完成操作
- **执行**：事件停止触发后执行
- **场景**：搜索框、表单验证

### 节流（Throttle）

- **用途**：限制执行频率
- **执行**：固定时间间隔执行
- **场景**：鼠标移动、滚动事件

### requestAnimationFrame

- **用途**：与浏览器刷新率同步
- **执行**：浏览器重绘前执行
- **场景**：动画、频繁更新

### RAF + 节流结合

- **优势**：
    1. RAF 确保流畅（与刷新率同步）
    2. 节流确保性能（不会过度执行）
    3. 双重保障，更稳定
- **适用**：需要频繁更新但要求流畅和性能的场景

在拖拽手柄插件中，这种组合确保了：

- ✅ 鼠标移动跟踪流畅（RAF）
- ✅ 不会过度执行（节流）
- ✅ CPU 占用低
- ✅ 用户体验好
