import type { ExampleOptions } from './types';

declare module 'example-editor' {
    interface Commands<ReturnType> {
        exampleCommand: (options?: ExampleOptions) => ReturnType;
    }
}

export {};
