import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useConfigContext, useStateContext } from '@/contexts';

export interface MacOSControlsProps {
    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * MacOS 控制按钮组件
 */
export const MacOSControls: React.FC<MacOSControlsProps> = React.memo(({ className }) => {
    const { options, messages, deleteNode, getPos } = useConfigContext();

    const { isCollapsed, isFullscreen, isCollapsible, toggleCollapse, handleFullscreen } =
        useStateContext();

    const {
        showClose = true,
        showCollapse = true,
        showFullscreen = true,
    } = options.macosControls || {};
    // 处理关闭（仅在此组件使用）
    const handleClose = useCallback(() => {
        if (deleteNode) {
            deleteNode();
        } else if (options.macosControls?.onClose) {
            // 这里不再传完整 node，只能传位置；如需 node，可在外部通过 getPos 重新获取
            options.macosControls.onClose?.(undefined, getPos());
        }
    }, [deleteNode, options.macosControls, getPos]);
    return (
        <div className={classNames('macos-controls', className)}>
            {showClose && (
                <button
                    type="button"
                    className="control-button close"
                    onClick={handleClose}
                    title={messages.controls.close}
                    aria-label={messages.controls.closeCodeBlock}
                >
                    <span className="control-dot red" />
                </button>
            )}

            {showCollapse && isCollapsible && (
                <button
                    type="button"
                    className={classNames('control-button collapse', {
                        'is-collapsed': isCollapsed,
                    })}
                    onClick={toggleCollapse}
                    title={isCollapsed ? messages.controls.expand : messages.controls.collapse}
                    aria-label={
                        isCollapsed
                            ? messages.controls.expandCodeBlock
                            : messages.controls.collapseCodeBlock
                    }
                >
                    <span className="control-dot yellow" />
                </button>
            )}

            {showFullscreen && (
                <button
                    type="button"
                    className="control-button fullscreen"
                    onClick={handleFullscreen}
                    title={
                        isFullscreen
                            ? messages.controls.exitFullscreen
                            : messages.controls.fullscreen
                    }
                    aria-label={
                        isFullscreen
                            ? messages.controls.exitFullscreenCodeBlock
                            : messages.controls.fullscreenCodeBlock
                    }
                >
                    <span className="control-dot green" />
                </button>
            )}
        </div>
    );
});

MacOSControls.displayName = 'MacOSControls';
