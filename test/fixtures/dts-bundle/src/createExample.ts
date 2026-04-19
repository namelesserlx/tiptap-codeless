import type { ExampleOptions } from '@/types';

export function createExample(options: ExampleOptions): string {
    return options.label;
}
