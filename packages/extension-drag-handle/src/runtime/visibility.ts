import type { CurrentNodeInfo } from '@/types';

export interface SafeZoneOptions {
    leftOffset?: number;
    verticalTolerance?: number;
}

function isValidRect(rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'> | null | undefined): rect is Pick<
    DOMRect,
    'left' | 'right' | 'top' | 'bottom'
> {
    if (!rect) {
        return false;
    }

    return (
        Number.isFinite(rect.left) &&
        Number.isFinite(rect.right) &&
        Number.isFinite(rect.top) &&
        Number.isFinite(rect.bottom)
    );
}

export function isPointInNodeSafeZone(
    nodeInfo: CurrentNodeInfo | null,
    x: number,
    y: number,
    options: SafeZoneOptions = {}
): boolean {
    if (!nodeInfo) {
        return false;
    }

    const rect = isValidRect(nodeInfo.rect)
        ? nodeInfo.rect
        : nodeInfo.dom?.getBoundingClientRect
          ? nodeInfo.dom.getBoundingClientRect()
          : null;
    if (!rect) {
        return false;
    }

    const leftOffset = options.leftOffset ?? 100;
    const verticalTolerance = options.verticalTolerance ?? 20;
    const safeLeft = rect.left - leftOffset;

    return (
        x >= safeLeft &&
        x <= rect.right &&
        y >= rect.top - verticalTolerance &&
        y <= rect.bottom + verticalTolerance
    );
}
