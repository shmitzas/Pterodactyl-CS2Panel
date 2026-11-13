import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

const Separator = () => (
    <span css={tw`px-0.5 text-rule-2`} aria-hidden={'true'}>
        /
    </span>
);

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory)
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory };
                }

                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <nav
            css={tw`flex min-w-0 flex-1 flex-wrap items-center gap-y-1 text-sm text-muted`}
            aria-label={'Current directory'}
        >
            {renderLeft}
            <span css={tw`px-0.5`}>home</span>
            <Separator />
            <NavLink
                to={`/server/${id}/files`}
                css={tw`rounded px-0.5 font-semibold text-ink-2 no-underline transition-colors duration-150 hover:text-accent-text`}
            >
                container
            </NavLink>
            {breadcrumbs().map((crumb, index) => (
                <React.Fragment key={index}>
                    <Separator />
                    {crumb.path ? (
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            css={tw`rounded px-0.5 font-semibold text-ink-2 no-underline transition-colors duration-150 hover:text-accent-text`}
                        >
                            {crumb.name}
                        </NavLink>
                    ) : (
                        <span css={tw`px-0.5 font-bold text-ink`} aria-current={'location'}>
                            {crumb.name}
                        </span>
                    )}
                </React.Fragment>
            ))}
            {file && (
                <>
                    <Separator />
                    <span css={tw`px-0.5 font-bold text-ink`} aria-current={'page'}>
                        {file}
                    </span>
                </>
            )}
        </nav>
    );
};
