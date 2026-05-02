import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import type { Selection } from '@tiptap/pm/state';

export type SelectedNodeMatch = {
    node: ProseMirrorNode;
    pos: number;
    depth: number;
};

export function findSelectedNodeByName(
    selection: Selection,
    nodeName: string
): SelectedNodeMatch | null {
    if (selection instanceof NodeSelection && selection.node.type.name === nodeName) {
        return {
            node: selection.node,
            pos: selection.from,
            depth: selection.$from.depth,
        };
    }

    for (let depth = selection.$from.depth; depth > 0; depth -= 1) {
        const node = selection.$from.node(depth);

        if (node.type.name === nodeName) {
            return {
                node,
                pos: selection.$from.before(depth),
                depth,
            };
        }
    }

    return null;
}
