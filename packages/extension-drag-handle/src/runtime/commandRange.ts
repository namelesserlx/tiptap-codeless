export type CommandRange = {
    from: number;
    to: number;
};

export type PositionMapper = {
    map: (pos: number) => number;
};

export function mapCommandRange(
    range: CommandRange | null | undefined,
    mapping: PositionMapper
): CommandRange | null {
    if (!range) {
        return null;
    }

    const from = mapping.map(range.from);
    const to = mapping.map(range.to);

    if (from >= to) {
        return null;
    }

    return { from, to };
}
