import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, NavLinkProps, Route, Switch, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Can from '@/components/elements/Can';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExternalLinkAlt,
    faPuzzlePiece,
    faServer,
    faSlidersH,
    faTools,
    faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router';
import classNames from 'classnames';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import Sidebar from '@/components/Sidebar';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { hashToPath } from '@/helpers';

const powerStates: Record<string, { label: string; dot: string }> = {
    running: { label: 'Running', dot: 'bg-cs2-success shadow-[0_0_8px_rgba(25,238,25,0.6)]' },
    starting: { label: 'Starting', dot: 'bg-cs2-warning' },
    stopping: { label: 'Stopping', dot: 'bg-cs2-warning' },
    offline: { label: 'Offline', dot: 'bg-cs2-danger' },
};

const SidebarServer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const power = (status && powerStates[status]) || { label: 'Connecting…', dot: 'bg-white/30' };

    return (
        <div className={'mb-4 flex items-center gap-3 border-b border-white/10 px-2 pb-4'}>
            <span
                className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] border border-cs2-accent/50 bg-cs2-accent/20 text-cs2-accent'
                }
            >
                <FontAwesomeIcon icon={faServer} />
            </span>
            <div className={'min-w-0'}>
                <p className={'truncate font-semibold text-white'} title={name}>
                    {name}
                </p>
                <p className={'flex items-center gap-1.5 text-xs text-white/50'}>
                    <span className={classNames('h-2 w-2 shrink-0 rounded-full', power.dot)} />
                    {power.label}
                </p>
            </div>
        </div>
    );
};

interface Shortcut {
    name: string;
    icon: IconProp;
    directory: string;
}

// File manager shortcuts into the CS2 + SwiftlyS2 tree.
const shortcuts: Shortcut[] = [
    { name: 'CS2 Configs', icon: faSlidersH, directory: '/game/csgo/cfg' },
    { name: 'SW2 Configs', icon: faWrench, directory: '/game/csgo/addons/swiftlys2/configs' },
    { name: 'Plugins Configs', icon: faTools, directory: '/game/csgo/addons/swiftlys2/configs/plugins' },
    { name: 'Plugins', icon: faPuzzlePiece, directory: '/game/csgo/addons/swiftlys2/plugins' },
];

const topRoutes = ['/', '/startup', '/settings'];
const listedRoutes = ['/schedules', '/users', '/network', '/activity', '/backups', '/databases'];
// Named routes missing from this layout are appended, so a newly added page can't drop out of the nav.
const bottomRoutes = listedRoutes.concat(
    routes.server
        .filter((route) => route.name && ![...topRoutes, '/files', ...listedRoutes].includes(route.path))
        .map((route) => route.path)
);

const ServerSidebar = () => {
    const { url } = useRouteMatch();
    const { hash } = useLocation();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.internalId);
    const invocation = ServerContext.useStoreState((state) => state.server.data!.invocation);

    // The shortcuts point into the CS2 game directory, so other eggs (TeamSpeak, ...) don't get them.
    const isCs2 = /\bcs(2|go)\b/i.test(invocation);
    const directory = hashToPath(hash);
    // The deepest shortcut containing the open directory is highlighted instead of Files.
    const activeShortcut = isCs2
        ? shortcuts
              .filter((s) => directory === s.directory || directory.startsWith(`${s.directory}/`))
              .sort((a, b) => b.directory.length - a.directory.length)[0]
        : undefined;

    const to = (path: string) => (path === '/' ? url : `${url.replace(/\/*$/, '')}${path}`);

    const routeLink = (path: string, isActive?: NavLinkProps['isActive']) => {
        const route = routes.server.find((route) => route.path === path);
        if (!route?.name) return null;

        const link = (
            <NavLink key={path} to={to(path)} exact={route.exact} isActive={isActive}>
                <div className='icon'>
                    <FontAwesomeIcon icon={route.iconProp as IconProp} />
                </div>
                {route.name}
            </NavLink>
        );

        return route.permission ? (
            <Can key={path} action={route.permission} matchAny>
                {link}
            </Can>
        ) : (
            link
        );
    };

    return (
        <Sidebar>
            <SidebarServer />
            <div className={'sidebar-group'}>
                {topRoutes.map((path) => routeLink(path))}
                {rootAdmin && (
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a href={`/admin/servers/view/${serverId}`} target={'_blank'}>
                        <div className='icon'>
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </div>
                        Admin
                    </a>
                )}
            </div>
            <div className={'sidebar-group'}>
                {isCs2 && (
                    <Can action={'file.*'} matchAny>
                        {shortcuts.map((shortcut) => (
                            <NavLink
                                key={shortcut.directory}
                                to={`${to('/files')}#${shortcut.directory}`}
                                isActive={(match) => !!match && activeShortcut === shortcut}
                            >
                                <div className='icon'>
                                    <FontAwesomeIcon icon={shortcut.icon} />
                                </div>
                                {shortcut.name}
                            </NavLink>
                        ))}
                    </Can>
                )}
                {routeLink('/files', (match) => !!match && !activeShortcut)}
            </div>
            <div className={'sidebar-group'}>{bottomRoutes.map((path) => routeLink(path))}</div>
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
                <>
                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <ServerSidebar />
                    </CSSTransition>
                    <InstallListener />
                    <TransferListener />
                    <WebsocketHandler />
                    {inConflictState && (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
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
                </>
            )}
        </React.Fragment>
    );
};
