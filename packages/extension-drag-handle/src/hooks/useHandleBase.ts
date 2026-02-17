import { useCallback, useMemo, useState } from 'react';
import { cancelHideDragHandle } from '../extension/DragHandlePlugin';
import { useDragHandleContext } from '../contexts/DragHandleContext';
import { calculateHandlePosition } from '../utils/position';

/** 默认样式配置 */
const DEFAULT_HANDLE_STYLE = {
    width: 24,
    height: 24,
    zIndex: 100,
    iconSize: 20,
} as const;

/**
 * Handle 基础 hook
 *
 * 提取 GripHandle 和 InsertHandle 的公共逻辑：
 * - 位置计算
 * - 样式配置
 * - 悬停状态管理
 */
export function useHandleBase() {
    const { editor, options, pluginState } = useDragHandleContext();
    const { currentNode: nodeInfo, isVisible: visible, locked } = pluginState;

    const [isHovering, setIsHovering] = useState(false);

    // 合并样式配置
    const handleStyle = useMemo(
        () => ({ ...DEFAULT_HANDLE_STYLE, ...options.handleStyle }),
        [options.handleStyle]
    );

    // 计算位置
    const position = useMemo(
        () => (nodeInfo ? calculateHandlePosition(nodeInfo, editor.view, options) : null),
        [nodeInfo, editor.view, options]
    );

    // 是否应该显示
    const shouldShow = visible && nodeInfo && position?.visible && editor.isEditable;

    // 处理鼠标进入
    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
        cancelHideDragHandle(editor);
    }, [editor]);

    // 处理鼠标离开
    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
    }, []);

    return {
        editor,
        options,
        nodeInfo,
        locked,
        position,
        handleStyle,
        isHovering,
        shouldShow,
        handleMouseEnter,
        handleMouseLeave,
    };
}
