import { mergeUiConfig } from '@tiptap-codeless/core';
import type { DragHandleEvents, DragHandleOptions } from '@/types';

const defaultHandle = {
    width: 24,
    height: 24,
    hoverDelay: 0,
    hideDelay: 100,
    zIndex: 100,
    iconSize: 20,
    icons: {
        insert: undefined,
        drag: undefined,
    },
};

const defaultOffset = {
    x: -32,
    y: 0,
};

const defaultInsertMenu = {
    enabled: true,
    trigger: '/' as string | RegExp | false,
    strategy: 'replace' as const,
    placement: 'left' as const,
    offset: {
        x: 0,
        y: 0,
    },
    zIndex: 1000,
    items: undefined,
    component: undefined,
};

const defaultDrag = {
    enabled: true,
    opacity: 0.5,
};

const defaultNodes = {
    include: undefined as string[] | undefined,
    exclude: [] as string[],
};

const defaultEvents: DragHandleEvents = {};

export const defaultDragHandleOptions: DragHandleOptions = {
    locale: 'zh-CN',
    messages: {},
    offset: defaultOffset,
    handle: defaultHandle,
    drag: defaultDrag,
    insertMenu: defaultInsertMenu,
    nodes: defaultNodes,
    events: defaultEvents,
};

export function normalizeDragHandleOptions(
    options: DragHandleOptions = {}
): DragHandleOptions & {
    locale: string;
    messages: NonNullable<DragHandleOptions['messages']>;
    offset: NonNullable<DragHandleOptions['offset']>;
    handle: NonNullable<DragHandleOptions['handle']>;
    drag: NonNullable<DragHandleOptions['drag']>;
    insertMenu: NonNullable<DragHandleOptions['insertMenu']>;
    nodes: {
        include?: string[];
        exclude: string[];
    };
    events: DragHandleEvents;
} {
    const handle = mergeUiConfig(defaultHandle, options.handle) as NonNullable<
        DragHandleOptions['handle']
    >;

    return {
        ...defaultDragHandleOptions,
        ...options,
        locale: options.locale ?? defaultDragHandleOptions.locale ?? 'zh-CN',
        messages: options.messages ?? defaultDragHandleOptions.messages ?? {},
        offset: {
            ...defaultOffset,
            ...options.offset,
        },
        handle: {
            ...handle,
            icons: {
                ...defaultHandle.icons,
                ...options.handle?.icons,
            },
        },
        drag: {
            ...defaultDrag,
            ...options.drag,
        },
        insertMenu: {
            ...defaultInsertMenu,
            ...options.insertMenu,
            offset: {
                ...defaultInsertMenu.offset,
                ...options.insertMenu?.offset,
            },
        },
        nodes: {
            include: options.nodes?.include ?? defaultNodes.include,
            exclude: options.nodes?.exclude ?? defaultNodes.exclude,
        },
        events: {
            ...defaultEvents,
            ...options.events,
        },
    };
}
