export * from '@/components';
export { CodeBlockPro, default } from '@/extension/CodeBlockProExtension';
export * from '@/hooks';
export type * from '@/types';

import { injectStyles } from '@tiptap-codeless/core';
import css from '@/styles/index.css?inline';

injectStyles({
    id: 'tiptap-codeless-code-block-pro',
    css,
});
