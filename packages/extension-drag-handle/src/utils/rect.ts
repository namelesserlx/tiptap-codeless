import type { CurrentNodeInfo } from '@/types';

export function areRectsEqual(
    previousRect: CurrentNodeInfo['rect'] | undefined,
    nextRect: CurrentNodeInfo['rect'] | undefined
): boolean {
    if (previousRect === nextRect) {
        return true;
    }

    if (!previousRect || !nextRect) {
        return false;
    }

    return (
        previousRect.left === nextRect.left &&
        previousRect.top === nextRect.top &&
        previousRect.right === nextRect.right &&
        previousRect.bottom === nextRect.bottom &&
        previousRect.width === nextRect.width &&
        previousRect.height === nextRect.height
    );
}

export function areNodeInfosEqual(
    previousNode: CurrentNodeInfo | null,
    nextNode: CurrentNodeInfo | null
): boolean {
    if (previousNode === nextNode) {
        return true;
    }

    if (!previousNode || !nextNode) {
        return false;
    }

    return (
        previousNode.pos === nextNode.pos &&
        previousNode.node === nextNode.node &&
        previousNode.dom === nextNode.dom &&
        previousNode.isEmpty === nextNode.isEmpty &&
        areRectsEqual(previousNode.rect, nextNode.rect)
    );
}
