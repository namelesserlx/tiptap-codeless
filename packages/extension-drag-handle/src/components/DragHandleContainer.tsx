import type { Editor } from '@tiptap/core';
import React, { memo } from 'react';
import { DragHandleProvider } from '../contexts/DragHandleContext';
import { InsertMenuProvider } from '../contexts/InsertMenuContext';
import type { DragHandleOptions, DragHandlePluginState } from '../types';
import { DragHandle } from './DragHandle';
import { InsertMenu } from './InsertMenu';

export interface DragHandleContainerProps {
    /** 编辑器实例 */
    editor: Editor;
    /** 扩展选项 */
    options: DragHandleOptions;
    /** 插件状态 */
    pluginState: DragHandlePluginState;
}

/**
 * 拖拽手柄容器组件
 */
export const DragHandleContainer: React.FC<DragHandleContainerProps> = memo(
    ({ editor, options, pluginState }) => {
        // 确保编辑器已挂载
        if (!editor.view.dom.parentElement) {
            return null;
        }

        return (
            <DragHandleProvider editor={editor} options={options} pluginState={pluginState}>
                <InsertMenuProvider>
                    <DragHandle />
                    <InsertMenu />
                </InsertMenuProvider>
            </DragHandleProvider>
        );
    }
);

DragHandleContainer.displayName = 'DragHandleContainer';

export default DragHandleContainer;
