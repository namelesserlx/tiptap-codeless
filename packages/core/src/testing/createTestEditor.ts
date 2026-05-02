import { Editor, Node } from '@tiptap/core';
import type { AnyExtension, Content } from '@tiptap/core';

const TestDoc = Node.create({
    name: 'doc',
    topNode: true,
    content: 'block+',
});

const TestParagraph = Node.create({
    name: 'paragraph',
    group: 'block',
    content: 'inline*',
    parseHTML() {
        return [{ tag: 'p' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['p', HTMLAttributes, 0];
    },
});

const TestText = Node.create({
    name: 'text',
    group: 'inline',
});

export interface CreateTestEditorOptions {
    content?: Content;
    element?: HTMLElement;
    extensions?: AnyExtension[];
}

export function createTestEditor(options: CreateTestEditorOptions = {}) {
    const element =
        options.element ??
        (typeof document !== 'undefined' ? document.createElement('div') : undefined);

    if (element && typeof document !== 'undefined' && !element.isConnected) {
        document.body.appendChild(element);
    }

    return new Editor({
        element,
        content: options.content ?? '<p></p>',
        extensions: [TestDoc, TestParagraph, TestText, ...(options.extensions ?? [])],
    });
}
