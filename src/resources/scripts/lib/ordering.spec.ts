import { mergeOrder, moveItem, sortByOrder } from '@/lib/ordering';

describe('@/lib/ordering.ts', function () {
    describe('sortByOrder()', function () {
        it('should sort ranked items first and keep the rest in their original order', function () {
            const items = ['a', 'b', 'c', 'd'].map((uuid) => ({ uuid }));

            expect(sortByOrder(items, ['c', 'a', 'gone']).map((i) => i.uuid)).toEqual(['c', 'a', 'b', 'd']);
            expect(sortByOrder(items, []).map((i) => i.uuid)).toEqual(['a', 'b', 'c', 'd']);
        });
    });

    describe('moveItem()', function () {
        it('should drop after the target when moving down and before it when moving up', function () {
            expect(moveItem(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
            expect(moveItem(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
        });

        it('should return the list unchanged for unknown or identical items', function () {
            const list = ['a', 'b'];

            expect(moveItem(list, 'a', 'a')).toBe(list);
            expect(moveItem(list, 'x', 'a')).toBe(list);
        });
    });

    describe('mergeOrder()', function () {
        it('should put the visible order first and keep the relative order of the rest', function () {
            expect(mergeOrder(['d', 'c'], ['a', 'b', 'c', 'd', 'e'])).toEqual(['d', 'c', 'a', 'b', 'e']);
        });
    });
});
