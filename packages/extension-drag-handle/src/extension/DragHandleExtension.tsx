import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { DragHandleContainer } from '../components/DragHandleContainer';
import type { DragHandleOptions, DragHandlePluginState } from '../types';
import { createDragHandlePlugin } from './DragHandlePlugin';

/**
 * 扩展 Tiptap 命令接口
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        dragHandle: {
            /**
             * 锁定拖拽手柄
             */
            lockDragHandle: () => ReturnType;
            /**
             * 解锁拖拽手柄
             */
            unlockDragHandle: () => ReturnType;
            /**
             * 隐藏拖拽手柄
             */
            hideDragHandle: () => ReturnType;
        };
    }
}

/**
 * 默认配置
 */
const defaultOptions: DragHandleOptions = {
    offset: {
        x: -32,
        y: 0,
    },
    insertMenu: {
        enabled: true,
        triggerOnSlash: true,
    },
    drag: {
        enabled: true,
        dragOpacity: 0.5,
    },
    handleStyle: {
        width: 24,
        height: 24,
        hoverDelay: 50,
        hideDelay: 100,
    },
    excludeNodes: [],
};

/**
 * DragHandle 扩展
 */
export const DragHandle = Extension.create<DragHandleOptions>({
    name: 'dragHandle',

    addOptions() {
        return defaultOptions;
    },

    addProseMirrorPlugins() {
        const { editor, options } = this;
        let renderer: ReactRenderer | null = null;
        let currentState: DragHandlePluginState = {
            locked: false,
            currentNode: null,
            isDragging: false,
            isVisible: false,
        };

        // 创建 React 渲染器的函数
        const createRenderer = () => {
            if (renderer) {
                renderer.destroy();
            }

            renderer = new ReactRenderer(DragHandleContainer, {
                editor,
                props: {
                    editor,
                    options,
                    pluginState: currentState,
                },
            });
        };

        // 状态变化回调
        const onStateChange = (state: DragHandlePluginState) => {
            currentState = state;

            if (renderer) {
                renderer.updateProps({
                    pluginState: state,
                });
            }
        };

        // 创建插件
        const plugin = createDragHandlePlugin({
            editor,
            options,
            onStateChange,
        });

        // 延迟创建渲染器，确保编辑器已经挂载
        setTimeout(() => {
            createRenderer();
        }, 0);

        // 监听编辑器销毁
        editor.on('destroy', () => {
            if (renderer) {
                renderer.destroy();
                renderer = null;
            }
        });

        return [plugin];
    },

    addCommands() {
        return {
            lockDragHandle:
                () =>
                ({ tr, dispatch }) => {
                    if (dispatch) {
                        tr.setMeta('lockDragHandle', true);
                    }
                    return true;
                },
            unlockDragHandle:
                () =>
                ({ tr, dispatch }) => {
                    if (dispatch) {
                        tr.setMeta('lockDragHandle', false);
                    }
                    return true;
                },
            hideDragHandle:
                () =>
                ({ tr, dispatch }) => {
                    if (dispatch) {
                        tr.setMeta('hideDragHandle', true);
                    }
                    return true;
                },
        };
    },
});

export default DragHandle;
