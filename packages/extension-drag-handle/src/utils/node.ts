/**
 * 节点相关工具函数
 */

import type { Node } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import type { CurrentNodeInfo } from '../types';

/**
 * 获取顶层块节点和位置（合并函数，避免重复调用 doc.resolve）
 */
export function getOuterNodeInfo(doc: Node, pos: number): { node: Node; pos: number } | null {
    const $pos = doc.resolve(pos);
    if ($pos.depth === 0) {
        return null;
    }
    // 获取 depth=1 的节点和位置
    return {
        node: $pos.node(1),
        pos: $pos.before(1),
    };
}

/**
 * 获取顶层块节点
 * @deprecated 使用 getOuterNodeInfo 代替，避免重复调用 doc.resolve
 */
export function getOuterNode(doc: Node, pos: number): Node | null {
    return getOuterNodeInfo(doc, pos)?.node ?? null;
}

/**
 * 获取顶层块节点的位置
 * @deprecated 使用 getOuterNodeInfo 代替，避免重复调用 doc.resolve
 */
export function getOuterNodePos(doc: Node, pos: number): number {
    return getOuterNodeInfo(doc, pos)?.pos ?? -1;
}

/**
 * 获取外层 DOM 节点
 * 从给定的 DOM 节点向上遍历，直到找到编辑器 DOM 的直接子节点
 */
export function getOuterDomNode(view: EditorView, domNode: HTMLElement): HTMLElement {
    let current = domNode;

    while (current?.parentNode) {
        if (current.parentNode === view.dom) {
            break;
        }
        current = current.parentNode as HTMLElement;
    }

    return current;
}

/**
 * 检查节点是否为空
 */
export function isNodeEmpty(node: Node): boolean {
    // 对于原子节点（如图片、视频、文件卡片），它们 content.size 为 0 是正常的
    // 但这些节点有可见内容，应该被视为非空节点
    if (node.isAtom) {
        return false;
    }

    if (node.type.name === 'paragraph') {
        // 没有内容
        if (node.content.size === 0) {
            return true;
        }
        // 只有空白文本
        const textContent = node.textContent.trim();
        return textContent.length === 0;
    }

    // 其他所有节点类型都视为非空
    return false;
}

/**
 * 从坐标获取节点信息的配置选项
 */
export interface GetNodeInfoOptions {
    /**
     * 如果在坐标处找不到节点，是否向指定方向查找
     */
    fallbackDirection?: 'left' | 'right';
    /**
     * 回退查找的最大距离（像素）
     */
    fallbackDistance?: number;
}

/**
 * 从 DOM 元素获取节点信息（内部函数）
 */
function getNodeInfoFromElement(view: EditorView, element: HTMLElement): CurrentNodeInfo | null {
    // 获取外层 DOM 节点
    const domNode = getOuterDomNode(view, element);
    if (!domNode || domNode === view.dom || domNode.nodeType !== 1) {
        return null;
    }

    try {
        let targetNode: Node | null = null;
        let targetNodePos = -1;

        // 方式一：先尝试 posAtDOM（O(1)，对普通节点效率高）
        try {
            const pos = view.posAtDOM(domNode, 0);
            const outerInfo = getOuterNodeInfo(view.state.doc, pos);
            if (outerInfo) {
                targetNode = outerInfo.node;
                targetNodePos = outerInfo.pos;
            }
        } catch {
            // posAtDOM 失败，继续尝试其他方式
        }

        // 方式二：如果 posAtDOM 失败，遍历文档查找（适用于 ReactNodeView）
        if (!targetNode) {
            view.state.doc.descendants((node, pos) => {
                if (targetNode) return false;

                const nodeDOM = view.nodeDOM(pos);
                if (
                    nodeDOM === domNode ||
                    (nodeDOM && domNode.contains(nodeDOM as globalThis.Node))
                ) {
                    targetNode = node;
                    targetNodePos = pos;
                    return false;
                }
                return true;
            });
        }

        if (!targetNode || targetNodePos === -1) {
            return null;
        }

        return {
            node: targetNode,
            pos: targetNodePos,
            dom: domNode,
            isEmpty: isNodeEmpty(targetNode),
            rect: domNode.getBoundingClientRect(),
        };
    } catch {
        return null;
    }
}

/**
 * 从坐标获取节点信息
 * @param view 编辑器视图
 * @param x 横坐标
 * @param y 纵坐标
 * @param options 可选配置，包含回退查找方向和距离
 */
export function getNodeInfoFromCoords(
    view: EditorView,
    x: number,
    y: number,
    options?: GetNodeInfoOptions
): CurrentNodeInfo | null {
    // 获取坐标处的DOM元素
    const elementAtPoint = document.elementFromPoint(x, y);

    // 检查是否在编辑器内
    if (elementAtPoint && view.dom.contains(elementAtPoint)) {
        const nodeInfo = getNodeInfoFromElement(view, elementAtPoint as HTMLElement);
        if (nodeInfo) {
            return nodeInfo;
        }
    }

    // 如果没找到且配置了回退查找，尝试向指定方向查找
    if (options?.fallbackDirection) {
        const element = findElementNearCoords(
            view,
            x,
            y,
            options.fallbackDirection,
            options.fallbackDistance ?? 50
        );
        if (element) {
            return getNodeInfoFromElement(view, element);
        }
    }

    return null;
}

/**
 * 从位置获取节点信息
 */
export function getNodeInfoFromPos(view: EditorView, pos: number): CurrentNodeInfo | null {
    try {
        const outerInfo = getOuterNodeInfo(view.state.doc, pos);
        if (!outerInfo) {
            return null;
        }

        const domNode = view.nodeDOM(outerInfo.pos) as HTMLElement;
        if (!domNode) {
            return null;
        }

        const outerDom = getOuterDomNode(view, domNode);

        return {
            node: outerInfo.node,
            pos: outerInfo.pos,
            dom: outerDom,
            isEmpty: isNodeEmpty(outerInfo.node),
            rect: outerDom.getBoundingClientRect(),
        };
    } catch {
        return null;
    }
}

/**
 * 查找鼠标位置附近的元素
 * 支持向左/右方向查找
 * 注意：从 step=1 开始，因为 step=0 通常已经在调用方检查过了
 */
export function findElementNearCoords(
    view: EditorView,
    x: number,
    y: number,
    direction: 'left' | 'right' = 'right',
    maxDistance: number = 100
): HTMLElement | null {
    const step = 5;
    const steps = Math.floor(maxDistance / step);

    // 从 1 开始，避免重复检查起点（起点通常已经检查过了）
    for (let i = 1; i <= steps; i++) {
        const offsetX = direction === 'right' ? i * step : -i * step;
        const element = document.elementFromPoint(x + offsetX, y) as HTMLElement;

        if (element && view.dom.contains(element)) {
            const outerDom = getOuterDomNode(view, element);
            if (outerDom && outerDom !== view.dom) {
                return outerDom;
            }
        }
    }

    return null;
}

/**
 * 检查节点类型是否应该显示拖拽手柄
 */
export function shouldShowHandle(
    node: Node,
    excludeNodes?: string[],
    includeOnlyNodes?: string[]
): boolean {
    const typeName = node.type.name;

    // 如果指定了包含列表，只有在列表中的才显示
    if (includeOnlyNodes && includeOnlyNodes.length > 0) {
        return includeOnlyNodes.includes(typeName);
    }

    // 如果指定了排除列表，在列表中的不显示
    if (excludeNodes && excludeNodes.length > 0) {
        return !excludeNodes.includes(typeName);
    }

    return true;
}
