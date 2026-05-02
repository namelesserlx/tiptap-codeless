import { mapCommandRange } from '@/runtime/commandRange';
import type { CurrentNodeInfo, DragHandlePluginState } from '@/types';
import { areNodeInfosEqual } from '@/utils/rect';

export type TransactionMetaReader = {
    docChanged?: boolean;
    getMeta: (key: string) => unknown;
    mapping?: Parameters<typeof mapCommandRange>[1];
};

export function createInitialPluginState(): DragHandlePluginState {
    return {
        locked: false,
        currentNode: null,
        isDragging: false,
        isVisible: false,
        insertMenuCommandRange: null,
    };
}

export function showHandleForNode(
    state: DragHandlePluginState,
    nodeInfo: CurrentNodeInfo
): DragHandlePluginState {
    if (state.currentNode?.pos === nodeInfo.pos && state.isVisible) {
        return state;
    }

    return {
        ...state,
        currentNode: nodeInfo,
        isVisible: true,
    };
}

export function syncCurrentNode(
    state: DragHandlePluginState,
    nodeInfo: CurrentNodeInfo | null
): DragHandlePluginState {
    if (!nodeInfo) {
        return hideHandleState(state);
    }

    if (areNodeInfosEqual(state.currentNode, nodeInfo)) {
        return state;
    }

    return {
        ...state,
        currentNode: nodeInfo,
    };
}

export function hideHandleState(state: DragHandlePluginState): DragHandlePluginState {
    if (state.locked || state.isDragging) {
        return state;
    }

    if (!state.currentNode && !state.isVisible) {
        return state;
    }

    return {
        ...state,
        currentNode: null,
        isVisible: false,
    };
}

export function applyTransactionMetaToPluginState(
    state: DragHandlePluginState,
    transaction: TransactionMetaReader
): DragHandlePluginState {
    let nextState = state;

    const lockMeta = transaction.getMeta('lockDragHandle');
    if (lockMeta !== undefined && lockMeta !== nextState.locked) {
        nextState = {
            ...nextState,
            locked: Boolean(lockMeta),
        };
    }

    if (transaction.getMeta('hideDragHandle')) {
        nextState = hideHandleState(nextState);
    }

    const draggingMeta = transaction.getMeta('dragHandleDragging');
    if (draggingMeta !== undefined && draggingMeta !== nextState.isDragging) {
        nextState = {
            ...nextState,
            isDragging: Boolean(draggingMeta),
        };
    }

    const openInsertMenuMeta = transaction.getMeta('openInsertMenu') as
        | { commandRange?: DragHandlePluginState['insertMenuCommandRange'] }
        | undefined;
    if (
        openInsertMenuMeta?.commandRange &&
        (nextState.insertMenuCommandRange?.from !== openInsertMenuMeta.commandRange.from ||
            nextState.insertMenuCommandRange?.to !== openInsertMenuMeta.commandRange.to)
    ) {
        nextState = {
            ...nextState,
            insertMenuCommandRange: openInsertMenuMeta.commandRange,
        };
    }

    const updateCommandMeta = transaction.getMeta('updateInsertMenuCommandRange') as
        | { commandRange?: DragHandlePluginState['insertMenuCommandRange'] }
        | undefined;
    if (
        updateCommandMeta?.commandRange &&
        (nextState.insertMenuCommandRange?.from !== updateCommandMeta.commandRange.from ||
            nextState.insertMenuCommandRange?.to !== updateCommandMeta.commandRange.to)
    ) {
        nextState = {
            ...nextState,
            insertMenuCommandRange: updateCommandMeta.commandRange,
        };
    }

    if (transaction.getMeta('clearInsertMenuCommandRange') && nextState.insertMenuCommandRange) {
        nextState = {
            ...nextState,
            insertMenuCommandRange: null,
        };
    }

    if (transaction.docChanged && nextState.insertMenuCommandRange && transaction.mapping) {
        const mappedRange = mapCommandRange(nextState.insertMenuCommandRange, transaction.mapping);

        if (
            mappedRange !== nextState.insertMenuCommandRange &&
            (mappedRange?.from !== nextState.insertMenuCommandRange.from ||
                mappedRange?.to !== nextState.insertMenuCommandRange.to ||
                mappedRange === null)
        ) {
            nextState = {
                ...nextState,
                insertMenuCommandRange: mappedRange,
            };
        }
    }

    return nextState;
}
