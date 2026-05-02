import React from 'react';
import { useConfigContext } from '@/contexts';
import { CodeBlockBody } from '@/components/CodeBlockBody';
import { ExpandButton } from '@/components/ExpandButton';
import { MacOSControls } from '@/components/MacOSControls';
import { Toolbar } from '@/components/Toolbar';

export interface CodeBlockViewFullProps {
    isLazyPending?: boolean;
    lazyPlaceholder?: React.ReactNode;
}

export const CodeBlockViewFull: React.FC<CodeBlockViewFullProps> = ({
    isLazyPending = false,
    lazyPlaceholder = null,
}) => {
    const { bodyRef } = useConfigContext();

    return (
        <>
            {lazyPlaceholder}
            <div
                className="code-block-pro-container"
                style={isLazyPending ? { display: 'none' } : undefined}
                aria-hidden={isLazyPending || undefined}
            >
                {!isLazyPending && (
                    <div className="code-block-header" contentEditable={false}>
                        <MacOSControls />
                        <Toolbar />
                    </div>
                )}
                <div className="code-block-body" ref={bodyRef}>
                    <CodeBlockBody />
                </div>
                {!isLazyPending && <ExpandButton />}
            </div>
        </>
    );
};

CodeBlockViewFull.displayName = 'CodeBlockViewFull';
