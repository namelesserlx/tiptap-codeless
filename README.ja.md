# Tiptap Codeless

React 向けの Tiptap 拡張コレクションです。高度なコードブロック、ドラッグハンドル、スラッシュメニュー、ファイルアップロードを最小限の設定で導入できます。

ドキュメント:
- [English](README.md)
- [簡体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)

## パッケージ

- [`@tiptap-codeless/core`](./packages/core)
- [`@tiptap-codeless/extension-code-block-pro`](./packages/extension-code-block-pro)
- [`@tiptap-codeless/extension-drag-handle`](./packages/extension-drag-handle)
- [`@tiptap-codeless/extension-file-upload`](./packages/extension-file-upload)

## 共通設定

主要な 3 つの拡張は、次の i18n 設定を共有します。

```ts
SomeExtension.configure({
    locale: 'ja',
    messages: {
        // 必要な文言だけを上書き
    },
    ui: {
        // 拡張ごとの UI 設定
    },
});
```

対応ロケール:
- `zh-CN`
- `zh-TW`
- `en`
- `ja`

## 開発

```bash
pnpm install
pnpm test:run
pnpm type-check
pnpm build
```

## ライセンス

MIT © [namelesserlx](https://github.com/namelesserlx)
