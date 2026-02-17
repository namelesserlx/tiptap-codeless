# 开发指南

个人项目的本地开发与测试说明。

## 开发设置

### 环境要求

- Node.js >= 22.12.0
- pnpm >= 8.0.0

### 开始开发

```bash
# 克隆仓库
git clone https://github.com/namelesserlx/tiptap-codeless.git
cd tiptap-codeless

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev
```

## 项目结构

```text
tiptap-codeless/
├── packages/
│   ├── core/                    # 核心工具库
│   └── extension-*/             # 扩展包
├── examples/                    # 示例项目
└── docs/                        # 文档
```

## 代码规范

### TypeScript

- 使用严格的类型检查
- 避免使用 `any`
- 为所有公共 API 提供类型定义

### React

- 使用函数组件和 Hooks
- 适当使用 `React.memo`、`useMemo`、`useCallback` 优化性能

### 代码格式化

```bash
pnpm format
pnpm lint
```

### 推送到远程前

建议先执行（会先格式化，再 lint、类型检查、构建）：

```bash
pnpm prepush
```

通过后再 `git push`。

## 本地测试

### 示例项目测试

```bash
pnpm build

cd examples/file-upload
pnpm install && pnpm dev

# file-upload 示例的 Custom (COS) 模式需配置环境变量：
# 复制 .env.example 为 .env.local，填入腾讯云 COS 的 SecretId、SecretKey、Bucket、Region

# 或其他示例
cd examples/drag-handle
cd examples/code-block-pro
```

### 本地项目集成

在本地项目的 `package.json` 中使用路径引用：

```json
{
    "dependencies": {
        "@tiptap-codeless/extension-file-upload": "file:../tiptap-codeless/packages/extension-file-upload",
        "@tiptap-codeless/core": "file:../tiptap-codeless/packages/core"
    }
}
```

修改包源码后执行 `pnpm build` 或使用 `pnpm dev` 监听构建。

## 发布流程

1. 创建 changeset：`pnpm changeset`
2. 更新版本：`pnpm version-packages`
3. 发布：`pnpm release`
