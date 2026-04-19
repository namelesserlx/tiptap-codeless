import type { StorageMode, UploadHandler } from '@tiptap-codeless/extension-file-upload';
import { FileUpload, clearCachedDirectoryHandle } from '@tiptap-codeless/extension-file-upload';
import { Dropcursor, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { CosUtil } from './utils/cos.util';
import { isCosConfigured } from './utils/index';

// 获取文件类型
const getFileKind = (file: File): 'image' | 'video' | 'file' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
};

// 自定义 COS 上传处理器
const createCosUploadHandler = (): UploadHandler => {
    return async (files) => {
        const assets = await Promise.all(
            files.map(async (file) => {
                // 上传到 COS
                const url = await CosUtil.uploadFile(file, file.name, {
                    folder: 'uploads',
                });
                return {
                    kind: getFileKind(file),
                    url,
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    size: file.size,
                };
            })
        );
        return { assets };
    };
};

const initialContent = `
<h1>文件上传示例</h1>
<p>支持：拖拽/粘贴上传到编辑器内；图片/视频预览；图片选中后四角缩放；其他文件展示卡片。</p>
<p></p>
`;

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [storageMode, setStorageMode] = useState<StorageMode>('memory');

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({
                    // 禁用默认的 dropcursor，使用自定义配置
                    dropcursor: false,
                }),
                // 使用更明显的 dropcursor 样式
                Dropcursor.configure({
                    color: '#1890ff',
                    width: 3,
                    class: 'tiptap-drop-cursor',
                }),
                FileUpload.configure({
                    locale: 'zh-CN',
                    storageMode,
                    localStorageOptions: {
                        // 复用之前选择的目录
                        alwaysAskDirectory: false,
                    },
                    // 当 storageMode 为 'custom' 时使用自定义上传处理器
                    upload: createCosUploadHandler(),
                    ui: {
                        bubbleMenu: {
                            enabled: true,
                            zIndex: 9999,
                        },
                    },
                    imgBubbleMenuConfig: {
                        enabled: true,
                        zIndex: 9999,
                    },
                    onError: (err: Error) => {
                        console.error('File upload error:', err);
                        alert('文件上传失败: ' + (err as Error).message);
                    },
                }),
                Placeholder.configure({
                    placeholder: '拖拽/粘贴文件到这里，或用右上角按钮插入…',
                }),
            ],
            content: initialContent,
        },
        [storageMode]
    );

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleStorageModeChange = (mode: StorageMode) => {
        setStorageMode(mode);
        // 切换到 local 模式时清除缓存的目录句柄
        if (mode === 'local') {
            clearCachedDirectoryHandle();
        }
        if (mode === 'custom') {
            // 预留：自定义存储模式
        }
    };

    return (
        <div className={`app ${theme}`} data-theme={theme}>
            <header className="header">
                <h1>File Upload 示例</h1>
                <div className="header-actions">
                    <select
                        className="storage-mode-select"
                        value={storageMode}
                        onChange={(e) => handleStorageModeChange(e.target.value as StorageMode)}
                    >
                        <option value="memory">Memory (临时)</option>
                        <option value="base64">Base64 (嵌入文档)</option>
                        <option value="local">Local (保存到本地)</option>
                        <option value="custom">Custom (自定义上传)</option>
                    </select>
                    <button
                        className="action-button"
                        onClick={() => editor?.commands.openFileDialog({ accept: 'image/*' })}
                        disabled={!editor}
                    >
                        插入图片
                    </button>
                    <button
                        className="action-button"
                        onClick={() => editor?.commands.openFileDialog({ accept: 'video/*' })}
                        disabled={!editor}
                    >
                        插入视频
                    </button>
                    <button
                        className="action-button"
                        onClick={() => editor?.commands.openFileDialog({ accept: '*/*' })}
                        disabled={!editor}
                    >
                        插入文件
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}
                    </button>
                </div>
            </header>

            <main className="main">
                <div className="editor-wrapper">
                    <EditorContent editor={editor} className="editor" />
                </div>
            </main>

            <footer className="footer">
                <p>
                    💡
                    提示：支持拖拽/粘贴；点击图片后可四角缩放；视频可直接预览播放；其他文件显示卡片。
                </p>
                <p>
                    当前存储模式：
                    <strong>
                        {storageMode === 'memory' && '内存模式 (刷新后丢失)'}
                        {storageMode === 'base64' && 'Base64 模式 (嵌入文档)'}
                        {storageMode === 'local' && '本地模式 (保存到本地目录)'}
                        {storageMode === 'custom' &&
                            (isCosConfigured()
                                ? '自定义上传 (COS)'
                                : '自定义上传 (未配置 .env.local)')}
                    </strong>
                </p>
            </footer>
        </div>
    );
}

export default App;
