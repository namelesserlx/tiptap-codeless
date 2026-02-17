import React from 'react';
import type { CodeBlockViewProps } from '@/types';
import { CodeBlockViewFull } from '@/components/CodeBlockViewFull';
import { CodeBlockViewLazy } from '@/components/CodeBlockViewLazy';

export const CodeBlockView: React.FC<CodeBlockViewProps> = (props) => {
    const isLazyEnabled = props.extension?.options?.lazyRender?.enabled ?? false;

    if (isLazyEnabled) {
        return <CodeBlockViewLazy {...props} />;
    }

    return <CodeBlockViewFull {...props} />;
};

CodeBlockView.displayName = 'CodeBlockView';
