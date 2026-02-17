/**
 * 拖拽相关工具函数
 */

import type { Editor } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { dropPoint } from '@tiptap/pm/transform';
import type { CurrentNodeInfo } from '../types';

// MIME 类型常量
export const DRAG_HANDLE_MIME = 'application/x-tiptap-drag-handle';
export const DRAG_HANDLE_FROM_POS_MIME = 'application/x-tiptap-drag-handle-from-pos';
export const DRAG_HANDLE_NODE_JSON_MIME = 'application/x-tiptap-drag-handle-node-json';
export const DRAG_HANDLE_NODE_SIZE_MIME = 'application/x-tiptap-drag-handle-node-size';

// 预览样式常量
const PREVIEW_STYLES = {
    background: 'rgba(24, 144, 255, 0.1)',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    opacity: '0.5',
} as const;

/**
 * 创建图片节点的 Canvas 预览
 * 使用 Canvas 直接绘制已加载的图片，避免 blob URL 重新加载问题
 */
function createImagePreview(img: HTMLImageElement): HTMLCanvasElement {
    const rect = img.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = PREVIEW_STYLES.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    Object.assign(canvas.style, {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        borderRadius: PREVIEW_STYLES.borderRadius,
        boxShadow: PREVIEW_STYLES.boxShadow,
    });

    return canvas;
}

/**
 * 创建普通节点的 DOM 克隆预览
 */
function createDOMPreview(domNode: HTMLElement): HTMLElement {
    const rect = domNode.getBoundingClientRect();
    const clone = domNode.cloneNode(true) as HTMLElement;

    Object.assign(clone.style, {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        opacity: PREVIEW_STYLES.opacity,
        pointerEvents: 'none',
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        background: PREVIEW_STYLES.background,
        borderRadius: PREVIEW_STYLES.borderRadius,
        boxShadow: PREVIEW_STYLES.boxShadow,
        overflow: 'hidden',
    });

    return clone;
}

/**
 * 创建拖拽预览元素
 * 根据节点类型选择最佳的预览方式
 */
function createDragPreview(domNode: HTMLElement): HTMLElement {
    // 检查是否包含已加载的图片
    const img = domNode.querySelector('img') as HTMLImageElement | null;
    const isImageLoaded = img?.complete && img.naturalWidth > 0;

    return isImageLoaded ? createImagePreview(img) : createDOMPreview(domNode);
}

/**
 * 设置拖拽数据到 DataTransfer
 */
function setDragTransferData(
    dataTransfer: DataTransfer,
    nodeInfo: CurrentNodeInfo,
    pos: number
): void {
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData(DRAG_HANDLE_MIME, 'true');
    dataTransfer.setData(DRAG_HANDLE_FROM_POS_MIME, String(pos));
    dataTransfer.setData(DRAG_HANDLE_NODE_SIZE_MIME, String(nodeInfo.node.nodeSize));
    dataTransfer.setData(DRAG_HANDLE_NODE_JSON_MIME, JSON.stringify(nodeInfo.node.toJSON()));

    // 某些浏览器需要 text/plain 类型才能正常拖拽
    if (!dataTransfer.getData('text/plain')) {
        dataTransfer.setData('text/plain', ' ');
    }
}

/**
 * 开始拖拽节点
 */
export function startDragNode(editor: Editor, nodeInfo: CurrentNodeInfo, event: DragEvent): void {
    const { pos, dom: domNode } = nodeInfo;
    const { view } = editor;
    const { dataTransfer } = event;

    if (!dataTransfer) return;

    // 1. 创建节点选区
    const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
    view.dispatch(tr);

    // 2. 设置拖拽数据
    setDragTransferData(dataTransfer, nodeInfo, pos);

    // 3. 创建并设置拖拽预览
    if (domNode) {
        const rect = domNode.getBoundingClientRect();
        const offset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };

        const preview = createDragPreview(domNode);
        document.body.appendChild(preview);
        dataTransfer.setDragImage(preview, offset.x, offset.y);

        // 下一帧移除预览元素
        requestAnimationFrame(() => {
            preview.remove();
        });
    }
}

/**
 * 处理拖拽放置
 */
export function handleDrop(
    editor: Editor,
    event: DragEvent,
    slice: Slice | null | undefined // ProseMirror Slice
): boolean {
    const { view } = editor;

    // 检查是否是我们的拖拽
    const isDragHandle = event.dataTransfer?.getData(DRAG_HANDLE_MIME);
    if (!isDragHandle) {
        return false;
    }

    if (!editor.isEditable) {
        return true;
    }

    const dt = event.dataTransfer;
    if (!dt) {
        return true;
    }

    // 获取放置位置
    const dropPos = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
    });

    if (!dropPos) {
        return true;
    }

    event.preventDefault();

    const state = view.state;
    const fromPosStr = dt.getData(DRAG_HANDLE_FROM_POS_MIME);
    const fromPos = Number.parseInt(fromPosStr, 10);
    const nodeSizeStr = dt.getData(DRAG_HANDLE_NODE_SIZE_MIME);
    const storedNodeSize = Number.parseInt(nodeSizeStr, 10);

    const nodeFromDoc = Number.isFinite(fromPos) ? state.doc.nodeAt(fromPos) : null;
    const nodeToMove =
        nodeFromDoc ??
        (() => {
            const json = dt.getData(DRAG_HANDLE_NODE_JSON_MIME);
            if (!json) return null;
            try {
                return state.schema.nodeFromJSON(JSON.parse(json));
            } catch {
                return null;
            }
        })();

    if (!nodeToMove) {
        return true;
    }

    const nodeSize =
        nodeFromDoc?.nodeSize ??
        (Number.isFinite(storedNodeSize) ? storedNodeSize : nodeToMove.nodeSize);
    const rawDropPos = dropPos.pos;

    // 自己拖到自己身上：不做任何事
    if (Number.isFinite(fromPos) && nodeFromDoc) {
        if (rawDropPos >= fromPos && rawDropPos <= fromPos + nodeSize) {
            return true;
        }
    }

    const sliceToInsert =
        slice && slice.content.size ? slice : new Slice(Fragment.from(nodeToMove), 0, 0);

    let tr = state.tr;

    // 优先视作“移动”（同文档拖拽）
    if (Number.isFinite(fromPos) && nodeFromDoc) {
        tr = tr.delete(fromPos, fromPos + nodeSize);
        const mappedDropPos = tr.mapping.map(rawDropPos);
        const insertPos = dropPoint(tr.doc, mappedDropPos, sliceToInsert) ?? mappedDropPos;
        tr = tr.insert(insertPos, sliceToInsert.content);
    } else {
        // 降级为“复制插入”（无法定位源节点时）
        const insertPos = dropPoint(tr.doc, rawDropPos, sliceToInsert) ?? rawDropPos;
        tr = tr.insert(insertPos, sliceToInsert.content);
    }

    view.dispatch(tr.scrollIntoView());
    return true;
}

/**
 * 删除节点
 */
export function deleteNode(editor: Editor, pos: number): boolean {
    const { view } = editor;
    const { state } = view;

    try {
        const $pos = state.doc.resolve(pos);
        const node = $pos.nodeAfter;

        if (!node) {
            return false;
        }

        const tr = state.tr.delete(pos, pos + node.nodeSize);
        view.dispatch(tr);
        return true;
    } catch {
        return false;
    }
}

/**
 * 移动节点到新位置
 */
export function moveNode(editor: Editor, fromPos: number, toPos: number): boolean {
    const { view } = editor;
    const { state } = view;

    try {
        const $fromPos = state.doc.resolve(fromPos);
        const node = $fromPos.nodeAfter;

        if (!node) {
            return false;
        }

        const nodeSize = node.nodeSize;
        let tr = state.tr;

        // 如果目标位置在源位置之后，需要调整
        if (toPos > fromPos) {
            // 先插入，再删除
            tr = tr.insert(toPos, node);
            tr = tr.delete(fromPos, fromPos + nodeSize);
        } else {
            // 先删除，再插入
            tr = tr.delete(fromPos, fromPos + nodeSize);
            tr = tr.insert(toPos, node);
        }

        view.dispatch(tr);
        return true;
    } catch {
        return false;
    }
}

/**
 * 复制节点
 */
export function duplicateNode(editor: Editor, pos: number): boolean {
    const { view } = editor;
    const { state } = view;

    try {
        const $pos = state.doc.resolve(pos);
        const node = $pos.nodeAfter;

        if (!node) {
            return false;
        }

        const tr = state.tr.insert(pos + node.nodeSize, node);
        view.dispatch(tr);
        return true;
    } catch {
        return false;
    }
}
