import { CodeBlockPro } from '@tiptap-codeless/extension-code-block-pro';
import { DragHandle } from '@tiptap-codeless/extension-drag-handle';
import { FileUpload } from '@tiptap-codeless/extension-file-upload';
import type { Editor } from '@tiptap/core';
import { Dropcursor, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState } from 'react';
const lowlight = createLowlight(common);
type InsertMenuItem = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    command: (editor: Editor) => void;
};

type InsertMenuGroup = {
    id: string;
    title?: string;
    items: InsertMenuItem[];
};

const initialContent = `
<h1>一级标题</h1>
<h2>二级标题</h2>
<p>普通段落</p>
<blockquote>这是一个引用块，试试拖动它！</blockquote>
<p>最后一个段落。</p>
<p></p>
`;

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const insertMenuItems: (InsertMenuItem | InsertMenuGroup)[] = [
        {
            id: 'common',
            title: '常用',
            items: [
                {
                    id: 'insertImage',
                    label: '插入图片',
                    icon: <span style={{ fontWeight: 700 }}>IMG</span>,
                    command: (editor) => editor.commands.openFileDialog({ accept: 'image/*' }),
                },
                {
                    id: 'insertVideo',
                    label: '插入视频',
                    icon: <span style={{ fontWeight: 700 }}>VID</span>,
                    command: (editor) => editor.commands.openFileDialog({ accept: 'video/*' }),
                },
                {
                    id: 'insertFile',
                    label: '插入文件',
                    icon: <span style={{ fontWeight: 700 }}>FILE</span>,
                    command: (editor) => editor.commands.openFileDialog({ accept: '*/*' }),
                },
            ],
        },
    ];

    const editor = useEditor({
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
                // 默认使用 objectURL（可通过 options.upload 自定义上传到 OSS 等）
            }),
            DragHandle.configure({
                insertMenu: {
                    enabled: true,
                    triggerOnInput: true,
                    trigger: '/',
                    position: {
                        placement: 'right',
                    },
                    itemsMode: 'merge',
                    items: insertMenuItems,
                },
            }),
            CodeBlockPro.configure({
                lowlight,
                defaultLanguage: 'javascript',
                theme: theme,
                // macosControls: {
                //     showClose: true,
                //     showCollapse: true,
                //     showFullscreen: true,
                // },
                toolbar: {
                    showLanguageSelector: true,
                    showCopyButton: true,
                    showLineNumbersToggle: true,
                },
                lineNumbers: {
                    enabled: true,
                    startLine: 1,
                    toggleable: true,
                },
                collapse: {
                    enabled: true,
                    defaultCollapsed: false,
                    collapsedLines: 5,
                },
                lazyRender: {
                    enabled: true, // 启用延迟渲染
                    rootMargin: '100px', // 提前 100px 开始渲染
                    placeholderHeight: 120, // 占位符高度
                },
            }),
            Placeholder.configure({
                placeholder: '/ for commands...',
            }),
        ],
        content: initialContent,
    });

    // 同步主题到 html 元素，确保 fixed 定位的元素也能正确继承主题变量
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className={`app ${theme}`} data-theme={theme}>
            <header className="header">
                <h1>Drag Handle 示例</h1>
                <div className="header-actions">
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
                <p>💡 提示：将鼠标悬浮在内容行左侧，可以看到拖拽手柄。空行会显示插入按钮。</p>
            </footer>
        </div>
    );
}

export default App;
