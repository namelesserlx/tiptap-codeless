# Tiptap Codeless

適用於現代 React 應用的 Tiptap 擴充套件集合，提供進階程式碼區塊、拖曳手柄、斜線插入選單與檔案上傳能力，盡量減少樣板程式。

文件：
- [English](README.md)
- [簡體中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)

## 套件

- [`@tiptap-codeless/core`](./packages/core)
- [`@tiptap-codeless/extension-code-block-pro`](./packages/extension-code-block-pro)
- [`@tiptap-codeless/extension-drag-handle`](./packages/extension-drag-handle)
- [`@tiptap-codeless/extension-file-upload`](./packages/extension-file-upload)

## 共同設定約定

三個主要擴充套件現在共用以下設定入口：

```ts
SomeExtension.configure({
    locale: 'zh-TW',
    messages: {
        // 只覆寫需要的文案
    },
    ui: {
        // 擴充套件專屬 UI 設定
    },
});
```

支援語系：
- `zh-CN`
- `zh-TW`
- `en`
- `ja`

## 本地開發

```bash
pnpm install
pnpm test:run
pnpm type-check
pnpm build
```

## 授權

MIT © [namelesserlx](https://github.com/namelesserlx)
