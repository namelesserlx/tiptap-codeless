import { CodeBlockPro } from '@tiptap-codeless/extension-code-block-pro';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createLowlight } from 'lowlight';
import { useState } from 'react';

// 导入常用语言
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

// 创建 lowlight 实例并注册语言
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('py', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('bash', bash);

const initialContent = `
<h1>CodeBlock Pro 示例</h1>
<p>这是一个功能强大的代码块扩展示例，具有以下特性：</p>
<ul>
  <li>🎨 <strong>MacOS 风格设计</strong> - 经典的三按钮控制</li>
  <li>🌓 <strong>明暗主题支持</strong> - 支持明亮、暗黑和自动切换</li>
  <li>🔢 <strong>行号显示</strong> - 可切换的行号</li>
  <li>📁 <strong>代码折叠</strong> - 智能折叠长代码</li>
  <li>🎨 <strong>语法高亮</strong> - 支持 20+ 种编程语言</li>
  <li>📋 <strong>一键复制</strong> - 快速复制代码</li>
  <li>📊 <strong>Mermaid 图表</strong> - 支持 Mermaid 图表渲染和代码/图表切换</li>
</ul>

<h2>JavaScript 示例</h2>
<pre><code class="language-javascript">// 示例：快速排序算法
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('排序前:', numbers);
console.log('排序后:', quickSort(numbers));
</code></pre>

<h2>TypeScript 示例</h2>
<pre><code class="language-typescript">// 示例：泛型函数
interface User {
  id: number;
  name: string;
  email: string;
}

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

const user = findById(users, 1);
console.log(user);
</code></pre>

<h2>Python 示例</h2>
<pre><code class="language-python"># 示例：装饰器
from functools import wraps
from time import time

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time()
        result = func(*args, **kwargs)
        end = time()
        print(f'{func.__name__} 执行时间: {end - start:.4f}秒')
        return result
    return wrapper

@timing_decorator
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(f'斐波那契数列第10项: {fibonacci(10)}')
</code></pre>

<h2>Mermaid 图表示例</h2>
<pre><code class="language-mermaid">graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    D --> E[用户登录]
    E --> F{登录成功?}
    F -->|是| C
    F -->|否| G[显示错误信息]
    G --> D
    C --> H[结束]
</code></pre>

<p>试试选中代码块，你可以：</p>
<ul>
  <li>点击左侧的黄色按钮折叠/展开代码</li>
  <li>点击右侧的复制按钮复制代码</li>
  <li>切换语言选择器更改编程语言</li>
  <li>切换行号显示</li>
  <li><strong>对于 Mermaid 代码块</strong>：点击图表切换按钮在代码视图和图表视图之间切换</li>
</ul>
`;

type ThemeType = 'light' | 'dark' | 'auto';

function App() {
    const [theme, setTheme] = useState<ThemeType>('auto');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // 禁用默认的代码块
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
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
            },
        },
    });

    const handleThemeChange = (newTheme: ThemeType) => {
        setTheme(newTheme);
        if (editor) {
            // 更新编辑器中所有代码块的主题
            const { state, view } = editor;
            const { tr } = state;
            let modified = false;

            state.doc.descendants((node, pos) => {
                if (node.type.name === 'codeBlockPro') {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        theme: newTheme,
                    });
                    modified = true;
                }
            });

            if (modified) {
                view.dispatch(tr);
            }
        }
    };
    return (
        <div className="app-container">
            {/* 头部 */}
            <header className="app-header">
                <h1>CodeBlock Pro Example</h1>
                <div className="header-actions">
                    <div className="theme-switcher">
                        <label>主题:</label>
                        <button
                            className={theme === 'light' ? 'active' : ''}
                            onClick={() => handleThemeChange('light')}
                        >
                            ☀️ 明亮
                        </button>
                        <button
                            className={theme === 'dark' ? 'active' : ''}
                            onClick={() => handleThemeChange('dark')}
                        >
                            🌙 暗黑
                        </button>
                        <button
                            className={theme === 'auto' ? 'active' : ''}
                            onClick={() => handleThemeChange('auto')}
                        >
                            🔄 自动
                        </button>
                    </div>
                </div>
            </header>

            {/* 编辑器 */}
            <div className="editor-wrapper">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default App;
