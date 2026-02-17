export * from './types';

// Extension
export { FileUpload as default, FileUpload } from './extension/FileUploadExtension';
export { createFileUploadPlugin, fileUploadPluginKey } from './extension/FileUploadPlugin';

// Nodes (optional)
export { UploadFileCard } from './extension/nodes/FileCardNode';
export { UploadImage } from './extension/nodes/ImageNode';
export { UploadVideo } from './extension/nodes/VideoNode';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Upload helpers
export * from './utils/uploadHandlers';

// 自动注入样式
import { injectStyles } from '@tiptap-codeless/core';
import css from './styles/index.css?inline';

injectStyles({
    id: 'tiptap-codeless-file-upload',
    css,
});
