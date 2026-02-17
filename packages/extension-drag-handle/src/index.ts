export * from './types';

// 扩展
export { DragHandle as default, DragHandle } from './extension/DragHandleExtension';
export {
    cancelHideDragHandle,
    createDragHandlePlugin,
    dragHandlePluginKey,
    hideDragHandle,
    lockDragHandle,
    scheduleHideDragHandle,
} from './extension/DragHandlePlugin';

// 组件
export { DragHandle as DragHandleComponent } from './components/DragHandle';
export { DragHandleContainer } from './components/DragHandleContainer';
export * from './components/Icons';
export { InsertMenu } from './components/InsertMenu';

// Context
export {
    DragHandleProvider,
    useDragHandleContext,
    InsertMenuProvider,
    useInsertMenuContext,
    defaultInsertMenuItems,
    mergeInsertMenuItems,
    isMenuGroup,
} from './contexts';

// Hooks
export { useDragHandle } from './hooks/useDragHandle';

// 工具函数
export * from './utils';

// 自动注入样式
import { injectStyles } from '@tiptap-codeless/core';
import css from './styles/index.css?inline';

injectStyles({
    id: 'tiptap-codeless-drag-handle',
    css,
});
