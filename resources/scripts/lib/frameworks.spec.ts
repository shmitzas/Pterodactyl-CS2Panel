import { deepestMatch, detectFrameworks, isPathAllowed } from '@/lib/frameworks';

const keys = (listings: Record<string, string[] | null | undefined>, rules: string[] = []) =>
    detectFrameworks(listings, rules).map((framework) => `${framework.key}:${framework.root}`);

describe('@/lib/frameworks.ts', function () {
    describe('detectFrameworks()', function () {
        it('should find frameworks by folder name, keeping the folder case', function () {
            expect(keys({ '/game/csgo/addons': ['metamod', 'SwiftlyS2', 'maps'], '/game': ['csgo', 'sharp'] })).toEqual(
                ['metamod:/game/csgo/addons/metamod', 'swiftlys2:/game/csgo/addons/SwiftlyS2', 'modsharp:/game/sharp']
            );
        });

        it('should find nothing while loading or when an unrestricted listing fails', function () {
            expect(keys({ '/game/csgo/addons': undefined, '/game': null })).toEqual([]);
        });

        it('should fall back to the rules when a parent could not be listed', function () {
            const rules = ['/game/csgo/addons/counterstrikesharp/configs/', '/game/csgo/cfg'];

            expect(keys({ '/game/csgo/addons': null, '/game': null }, rules)).toEqual([
                'counterstrikesharp:/game/csgo/addons/counterstrikesharp',
            ]);
        });
    });

    describe('isPathAllowed()', function () {
        it('should allow a rule, what is below it, and anything without rules', function () {
            expect(isPathAllowed('/game/csgo/cfg', [])).toBe(true);
            expect(isPathAllowed('/game/csgo/cfg', ['game/csgo/cfg/'])).toBe(true);
            expect(isPathAllowed('/game/csgo/cfg/maps', ['/game/csgo/cfg'])).toBe(true);
            expect(isPathAllowed('/game/csgo/cfgs', ['/game/csgo/cfg'])).toBe(false);
            expect(isPathAllowed('/game/csgo', ['/game/csgo/cfg'])).toBe(false);
        });
    });

    describe('deepestMatch()', function () {
        const items = [
            { directory: '/game/csgo/addons/swiftlys2' },
            { directory: '/game/csgo/addons/swiftlys2/plugins' },
        ];

        it('should pick the deepest directory holding the path', function () {
            expect(deepestMatch(items, '/game/csgo/addons/swiftlys2/plugins/Ranks/')).toBe(items[1]);
            expect(deepestMatch(items, '/game/csgo/addons/swiftlys2/data')).toBe(items[0]);
            expect(deepestMatch(items, '/game/csgo/addons/swiftlys2-old')).toBeUndefined();
        });
    });
});
