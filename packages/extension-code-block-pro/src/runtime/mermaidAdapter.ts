import type { CodeBlockTheme } from '@/types';

type MermaidModule = {
    initialize: (options: Record<string, unknown>) => void;
    render: (id: string, content: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidModule> | null = null;

async function loadMermaid(): Promise<MermaidModule> {
    if (!mermaidPromise) {
        mermaidPromise = import('mermaid').then((module) => module.default as MermaidModule);
    }

    return mermaidPromise;
}

function resolveMermaidTheme(theme: CodeBlockTheme): 'dark' | 'default' {
    return theme === 'dark' ? 'dark' : 'default';
}

let serialQueue: Promise<unknown> = Promise.resolve();
let currentTheme: CodeBlockTheme | null = null;

export async function renderMermaidSvg(options: {
    id: string;
    content: string;
    theme: CodeBlockTheme;
}): Promise<string> {
    const mermaid = await loadMermaid();

    const result = serialQueue.then(async () => {
        if (currentTheme !== options.theme) {
            mermaid.initialize({
                startOnLoad: false,
                theme: resolveMermaidTheme(options.theme),
                securityLevel: 'loose',
            });
            currentTheme = options.theme;
        }

        return mermaid.render(options.id, options.content);
    });

    serialQueue = result.then(() => {}, () => {});

    const { svg } = await result;
    return svg;
}

export function resetMermaidAdapterForTests(): void {
    mermaidPromise = null;
    serialQueue = Promise.resolve();
    currentTheme = null;
}
