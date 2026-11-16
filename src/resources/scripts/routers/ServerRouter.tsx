import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, NavLinkProps, Route, Switch, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext, ServerStatus } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCubes,
    faExternalLinkAlt,
    faFeatherAlt,
    faHashtag,
    faPuzzlePiece,
    faServer,
    faShieldAlt,
    faSlidersH,
    faToolbox,
    faTools,
    faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router';
import classNames from 'classnames';
import useSWR from 'swr';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import Sidebar, { SidebarSection } from '@/components/Sidebar';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { encodePathSegments, hashToPath } from '@/helpers';
import loadDirectory, { FileObject } from '@/api/server/files/loadDirectory';
import { getDirectorySwrKey } from '@/plugins/useFileManagerSwr';
import { usePermissions } from '@/plugins/usePermissions';
import { deepestMatch, detectFrameworks, Framework, isPathAllowed } from '@/lib/frameworks';

const powerStates: Record<NonNullable<ServerStatus>, { label: string; tone: string }> = {
    running: { label: 'Running', tone: 'cs2-tone-ok' },
    starting: { label: 'Starting', tone: 'cs2-tone-warn' },
    stopping: { label: 'Stopping', tone: 'cs2-tone-warn' },
    offline: { label: 'Offline', tone: 'cs2-tone-bad' },
};

const SidebarServer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const power = (status && powerStates[status]) || { label: 'Connecting…', tone: 'cs2-tone-off' };

    return (
        <div className={'sidebar-server'}>
            <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={faServer} />
            </span>
            <span className={'sidebar-server-name'}>{name}</span>
            <span className={classNames('cs2-pill', power.tone)}>
                <span className={'cs2-pill-dot'} />
                {power.label}
            </span>
        </div>
    );
};

interface Shortcut {
    name: string;
    icon: IconProp;
    directory: string;
}

const frameworkIcons: Record<Framework['key'], IconProp> = {
    metamod: faCubes,
    swiftlys2: faFeatherAlt,
    counterstrikesharp: faHashtag,
    modsharp: faToolbox,
};

const folderIcons: Record<string, IconProp> = {
    configs: faWrench,
    'configs/plugins': faTools,
    plugins: faPuzzlePiece,
    modules: faPuzzlePiece,
};

// Folder names in a directory: undefined while loading, null when it is not listed or the listing failed.
const useFolderNames = (directory: string, enabled: boolean): string[] | null | undefined => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    // Shares the file manager's cache key, so creating or deleting a framework folder there updates this.
    const { data, error } = useSWR<FileObject[]>(
        enabled ? getDirectorySwrKey(uuid, directory) : null,
        () => loadDirectory(uuid, directory),
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    if (!enabled || error) return null;

    return data?.filter((file) => !file.isFile).map((file) => file.name);
};

const topRoutes = ['/', '/files', '/startup', '/settings'];
const listedRoutes = ['/schedules', '/users', '/network', '/activity', '/backups', '/databases'];
// Named routes missing from this layout are appended, so a newly added page can't drop out of the nav.
const otherRoutes = listedRoutes.concat(
    routes.server
        .filter((route) => route.name && ![...topRoutes, ...listedRoutes].includes(route.path))
        .map((route) => route.path)
);
const routePermissions = routes.server.flatMap((route) =>
    route.permission ? ([] as string[]).concat(route.permission) : []
);

const ServerSidebar = () => {
    const { url } = useRouteMatch();
    const { hash } = useLocation();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.internalId);
    const invocation = ServerContext.useStoreState((state) => state.server.data!.invocation);
    const rules = ServerContext.useStoreState((state) => state.server.fileRules);
    const granted = usePermissions(routePermissions);
    const [canRead] = usePermissions('file.read');

    // The shortcuts point into the CS2 game directory, so other eggs (TeamSpeak, ...) don't get them.
    const browse = /\bcs(2|go)\b/i.test(invocation) && canRead;
    const addons = useFolderNames('/game/csgo/addons', browse && isPathAllowed('/game/csgo/addons', rules));
    const game = useFolderNames('/game', browse && isPathAllowed('/game', rules));
    const detected = browse ? detectFrameworks({ '/game/csgo/addons': addons, '/game': game }, rules) : [];

    const allowed = (shortcut: Shortcut) => isPathAllowed(shortcut.directory, rules);
    const configs = browse
        ? [{ name: 'CS2 configs', icon: faSlidersH, directory: '/game/csgo/cfg' }].filter(allowed)
        : [];
    const roots = detected
        .map((framework) => ({ name: framework.name, icon: frameworkIcons[framework.key], directory: framework.root }))
        .filter(allowed);
    const groups = detected
        .map((framework) => ({
            framework,
            shortcuts: framework.folders
                .map((folder) => ({
                    name: folder.name,
                    icon: folderIcons[folder.path],
                    directory: `${framework.root}/${folder.path}`,
                }))
                .filter(allowed),
        }))
        .filter((group) => group.shortcuts.length > 0);

    // The deepest shortcut holding the open directory is highlighted; elsewhere in the tree it is Files.
    const active = deepestMatch(
        [...configs, ...roots, ...groups.flatMap((group) => group.shortcuts)],
        hashToPath(hash)
    );

    const to = (path: string) => (path === '/' ? url : `${url.replace(/\/*$/, '')}${path}`);

    const canSee = (path: string) => {
        const route = routes.server.find((route) => route.path === path);
        if (!route?.name) return false;

        return (
            !route.permission ||
            ([] as string[])
                .concat(route.permission)
                .some((permission) => granted[routePermissions.indexOf(permission)])
        );
    };

    const routeLink = (path: string, isActive?: NavLinkProps['isActive']) => {
        const route = routes.server.find((route) => route.path === path);
        if (!route || !canSee(path)) return null;

        return (
            <NavLink key={path} to={to(path)} exact={route.exact} isActive={isActive}>
                <span className={'icon'}>
                    <FontAwesomeIcon icon={route.iconProp as IconProp} />
                </span>
                {route.name}
            </NavLink>
        );
    };

    const shortcutLink = (shortcut: Shortcut) => (
        <NavLink
            key={shortcut.directory}
            to={`${to('/files')}#${encodePathSegments(shortcut.directory)}`}
            isActive={(match) => !!match && active === shortcut}
        >
            <span className={'icon'}>
                <FontAwesomeIcon icon={shortcut.icon} />
            </span>
            {shortcut.name}
        </NavLink>
    );

    const others = otherRoutes.filter(canSee);

    return (
        <Sidebar label={name}>
            <SidebarServer />
            <SidebarSection label={'Server controls'}>
                {routeLink('/')}
                {routeLink('/files', (match) => !!match && !active)}
                {configs.map(shortcutLink)}
                {routeLink('/startup')}
                {routeLink('/settings')}
                {rootAdmin && (
                    <a href={`/admin/servers/view/${serverId}`} target={'_blank'} rel={'noreferrer'}>
                        <span className={'icon'}>
                            <FontAwesomeIcon icon={faShieldAlt} />
                        </span>
                        Admin
                        <FontAwesomeIcon icon={faExternalLinkAlt} className={'end'} />
                        <span className={'sr-only'}> (opens in a new tab)</span>
                    </a>
                )}
            </SidebarSection>
            {roots.length > 0 && <SidebarSection label={'Plugin frameworks'}>{roots.map(shortcutLink)}</SidebarSection>}
            {groups.map(({ framework, shortcuts }) => (
                <SidebarSection key={framework.key} label={`${framework.name} files`}>
                    {shortcuts.map(shortcutLink)}
                </SidebarSection>
            ))}
            {others.length > 0 && (
                <SidebarSection label={'Other settings'}>{others.map((path) => routeLink(path))}</SidebarSection>
            )}
        </Sidebar>
    );
};

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar />
            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <div className={'cs2-shell'}>
                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <ServerSidebar />
                    </CSSTransition>
                    <main className={'cs2-main'}>
                        <InstallListener />
                        <TransferListener />
                        <WebsocketHandler />
                        {inConflictState &&
                        (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                            <ConflictStateRenderer />
                        ) : (
                            <ErrorBoundary>
                                <TransitionRouter>
                                    <Switch location={location}>
                                        {routes.server.map(({ path, permission, component: Component }) => (
                                            <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                                                <Spinner.Suspense>
                                                    <Component />
                                                </Spinner.Suspense>
                                            </PermissionRoute>
                                        ))}
                                        <Route path={'*'} component={NotFound} />
                                    </Switch>
                                </TransitionRouter>
                            </ErrorBoundary>
                        )}
                    </main>
                </div>
            )}
        </React.Fragment>
    );
};
