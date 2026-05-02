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
    /** UI Portal 宿主 */
    hostElement: HTMLElement | null;
}

/**
 * 拖拽手柄容器组件
 */
export const DragHandleContainer: React.FC<DragHandleContainerProps> = memo(
    ({ editor, options, pluginState, hostElement }) => {
        // 确保编辑器已挂载
        if (!hostElement) {
            return null;
        }

        return (
            <DragHandleProvider
                editor={editor}
                options={options}
                pluginState={pluginState}
                hostElement={hostElement}
            >
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
