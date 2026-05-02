import type { Editor } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { DragHandleContainer } from '../components/DragHandleContainer';
import { defaultDragHandleOptions, normalizeDragHandleOptions } from '../config/normalizeOptions';
import { getEditorUiHost } from '../runtime/host';
import { createInitialPluginState } from '../runtime/pluginState';
import { createRendererLifecycle } from '../runtime/rendererLifecycle';
import type { DragHandleOptions, DragHandlePluginState } from '../types';
import { createDragHandlePlugin } from './DragHandlePlugin';

type EditorWithContentComponent = Editor & {
    contentComponent?: unknown;
};

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
/**
 * DragHandle 扩展
 */
export const DragHandle = Extension.create<DragHandleOptions>({
    name: 'dragHandle',

    addOptions() {
        return defaultDragHandleOptions;
    },

    addProseMirrorPlugins() {
        const { editor } = this;
        const options = normalizeDragHandleOptions(this.options);
        let currentState: DragHandlePluginState = createInitialPluginState();
        let mountRetryId: ReturnType<typeof setTimeout> | null = null;

        const rendererLifecycle = createRendererLifecycle<{ pluginState: DragHandlePluginState }>(
            () =>
                new ReactRenderer(DragHandleContainer, {
                    editor,
                    props: {
                        editor,
                        options,
                        pluginState: currentState,
                        hostElement: getEditorUiHost(editor),
                    },
                }),
            0
        );

        const scheduleRendererMount = () => {
            const editorWithContentComponent = editor as EditorWithContentComponent;

            if (editorWithContentComponent.contentComponent) {
                rendererLifecycle.scheduleMount();
                return;
            }

            mountRetryId = setTimeout(() => {
                mountRetryId = null;
                scheduleRendererMount();
            }, 16);
        };

        const destroyRenderer = () => {
            if (mountRetryId) {
                clearTimeout(mountRetryId);
                mountRetryId = null;
            }
            rendererLifecycle.destroy();
            editor.off('destroy', destroyRenderer);
        };

        // 状态变化回调
        const onStateChange = (state: DragHandlePluginState) => {
            currentState = state;

            rendererLifecycle.updateProps({
                pluginState: state,
            });
        };

        // 创建插件
        const plugin = createDragHandlePlugin({
            editor,
            options,
            onStateChange,
        });

        // 延迟创建渲染器，确保编辑器已经挂载
        scheduleRendererMount();

        // 监听编辑器销毁
        editor.on('destroy', destroyRenderer);

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
