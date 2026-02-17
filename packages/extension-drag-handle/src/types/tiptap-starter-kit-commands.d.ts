import '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        paragraph: {
            setParagraph: () => ReturnType;
        };
        heading: {
            toggleHeading: (attributes: { level: number }) => ReturnType;
        };
        bulletList: {
            toggleBulletList: () => ReturnType;
        };
        orderedList: {
            toggleOrderedList: () => ReturnType;
        };
        blockquote: {
            toggleBlockquote: () => ReturnType;
        };
        codeBlock: {
            toggleCodeBlock: () => ReturnType;
        };
        horizontalRule: {
            setHorizontalRule: () => ReturnType;
        };
    }
}
