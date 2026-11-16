export interface FrameworkFolder {
    name: string;
    path: string;
}

export interface Framework {
    key: 'metamod' | 'swiftlys2' | 'counterstrikesharp' | 'modsharp';
    name: string;
    // The directory listed to find the framework, and the folder it installs into there.
    parent: string;
    folder: string;
    // Shortcuts below the framework root.
    folders: FrameworkFolder[];
}

export interface DetectedFramework extends Framework {
    root: string;
}

const pluginFolders: FrameworkFolder[] = [
    { name: 'Configs', path: 'configs' },
    { name: 'Plugin configs', path: 'configs/plugins' },
    { name: 'Plugins', path: 'plugins' },
];

export const frameworks: Framework[] = [
    { key: 'metamod', name: 'MetaMod', parent: '/game/csgo/addons', folder: 'metamod', folders: [] },
    { key: 'swiftlys2', name: 'SwiftlyS2', parent: '/game/csgo/addons', folder: 'swiftlys2', folders: pluginFolders },
    {
        key: 'counterstrikesharp',
        name: 'CounterStrikeSharp',
        parent: '/game/csgo/addons',
        folder: 'counterstrikesharp',
        folders: pluginFolders,
    },
    // ModSharp installs beside csgo/ rather than into its addons folder.
    {
        key: 'modsharp',
        name: 'ModSharp',
        parent: '/game',
        folder: 'sharp',
        folders: [
            { name: 'Configs', path: 'configs' },
            { name: 'Modules', path: 'modules' },
        ],
    },
];

export const normalizePath = (path: string): string => `/${path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')}`;

export const isWithin = (path: string, directory: string): boolean =>
    path === directory || path.startsWith(`${directory}/`);

// Mirrors FileController::assertPathsAllowed: a rule grants its directory and everything below it.
export const isPathAllowed = (path: string, rules: string[]): boolean =>
    !rules.length || rules.some((rule) => isWithin(normalizePath(path), normalizePath(rule)));

/**
 * Finds the frameworks in the folder names of each parent: undefined while loading, null when the parent
 * could not be listed. An unlisted parent falls back to the rules, as a rule inside a framework means an
 * admin granted that folder.
 */
export const detectFrameworks = (
    listings: Record<string, string[] | null | undefined>,
    rules: string[]
): DetectedFramework[] =>
    frameworks.flatMap((framework) => {
        const listing = listings[framework.parent];
        if (listing) {
            const folder = listing.find((name) => name.toLowerCase() === framework.folder);

            return folder ? [{ ...framework, root: `${framework.parent}/${folder}` }] : [];
        }

        const root = `${framework.parent}/${framework.folder}`;

        return listing === null && rules.some((rule) => isWithin(normalizePath(rule), root))
            ? [{ ...framework, root }]
            : [];
    });

// The deepest directory holding the path, so a framework's Plugins link wins over its root.
export const deepestMatch = <T extends { directory: string }>(items: T[], path: string): T | undefined => {
    const target = normalizePath(path);

    return items
        .filter((item) => isWithin(target, item.directory))
        .sort((a, b) => b.directory.length - a.directory.length)[0];
};
