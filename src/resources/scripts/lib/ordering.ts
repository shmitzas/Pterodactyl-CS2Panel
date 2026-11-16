/**
 * Sorts items by their position in `order`; items missing from it keep their original order at the end.
 */
export function sortByOrder<T extends { uuid: string }>(items: T[], order: string[]): T[] {
    const rank = new Map(order.map((uuid, index) => [uuid, index] as const));
    const position = (item: T) => rank.get(item.uuid) ?? Number.MAX_SAFE_INTEGER;

    return [...items].sort((a, b) => position(a) - position(b));
}

/**
 * Moves `from` to the slot of `to`: after it when dragging downwards, before it when dragging upwards.
 */
export function moveItem(list: string[], from: string, to: string): string[] {
    const source = list.indexOf(from);
    const target = list.indexOf(to);
    if (source < 0 || target < 0 || source === target) return list;

    const next = list.filter((uuid) => uuid !== from);
    next.splice(target, 0, from);

    return next;
}

/**
 * Puts the reordered visible items first and keeps the relative order of everything else, so reordering
 * one view (e.g. "your servers") never scrambles another.
 */
export function mergeOrder(visible: string[], order: string[]): string[] {
    const seen = new Set(visible);

    return [...visible, ...order.filter((uuid) => !seen.has(uuid))];
}
