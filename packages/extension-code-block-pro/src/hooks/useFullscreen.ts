/**
 * 全屏逻辑 Hook
 */

import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MacOSControlsConfig } from '@/types';

export interface UseFullscreenOptions {
    /**
     * MacOS 控制配置
     */
    macosControls?: MacOSControlsConfig;

    /**
     * 节点
     */
    node: ProseMirrorNode;

    /**
     * 获取节点位置
     */
    getPos: () => number;
}

/**
 * 全屏逻辑 Hook
 */
export function useFullscreen(options: UseFullscreenOptions) {
    const { macosControls, node, getPos } = options;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 使用 ref 保存 node 和 getPos 的最新值，避免 handleFullscreen 依赖它们
    // 这样可以避免每次 node 变化时都重新创建 handleFullscreen
    const nodeRef = useRef(node);
    const getPosRef = useRef(getPos);
    const macosControlsRef = useRef(macosControls);

    // 更新 ref 的值
    useEffect(() => {
        nodeRef.current = node;
        getPosRef.current = getPos;
        macosControlsRef.current = macosControls;
    }, [node, getPos, macosControls]);

    // 处理全屏切换 - 不依赖 node、getPos 和 macosControls，使用 ref 来访问最新值
    const handleFullscreen = useCallback(() => {
        if (macosControlsRef.current?.onFullscreen) {
            macosControlsRef.current.onFullscreen(nodeRef.current, getPosRef.current());
        } else {
            // 默认实现：切换全屏状态
            setIsFullscreen((prev) => !prev);
        }
    }, []); // 空依赖数组，使用 ref 来访问最新值

    // 监听 ESC 键退出全屏
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        // 全屏时禁止 body 滚动
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    return {
        isFullscreen,
        setIsFullscreen,
        wrapperRef,
        handleFullscreen,
    };
}
