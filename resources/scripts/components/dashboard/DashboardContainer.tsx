import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faServer } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow, { ServerUsage } from '@/components/dashboard/ServerRow';
import ServerTotals from '@/components/dashboard/ServerTotals';
import BulkActions from '@/components/dashboard/BulkActions';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import useDashboardPreferences from '@/plugins/useDashboardPreferences';
import { mergeOrder, moveItem, sortByOrder } from '@/lib/ordering';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styles from './dashboard.module.css';

// The API caps per_page at 100; a single page keeps the custom order global.
const PER_PAGE = 100;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const { preferences, save } = useDashboardPreferences();
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOrder, setDragOrder] = useState<string[] | null>(null);
    const dragStart = useRef({ order: '', dropped: false });
    const [usage, setUsage] = useState<Record<string, ServerUsage>>({});

    const onUsage = useCallback(
        (server: string, value: ServerUsage) => setUsage((current) => ({ ...current, [server]: value })),
        []
    );

    const listType = showOnlyAdmin && rootAdmin ? 'admin' : undefined;
    const { data: servers, error } = useSWR<PaginatedResult<Server>>(['/api/client/servers', listType, page], () =>
        getServers({ page, type: listType, per_page: PER_PAGE })
    );

    // Bulk groups pick from every server the account can manage, independent of the view toggle above.
    const poolType = rootAdmin ? 'admin-all' : undefined;
    const { data: pool, revalidate: revalidatePool } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', poolType, 1],
        () => getServers({ page: 1, type: poolType, per_page: PER_PAGE })
    );

    const visible = servers ? sortByOrder(servers.items, dragOrder || preferences.order) : [];

    // Upstream resets the page on every run, which would also drop a `?page=` the dashboard was opened with.
    const toggled = useRef(false);
    useEffect(() => {
        if (!toggled.current) {
            toggled.current = true;
            return;
        }
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, server: string) => {
        const row = e.currentTarget.closest('[data-server-row]');
        if (row instanceof HTMLElement) {
            const rect = row.getBoundingClientRect();
            e.dataTransfer.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
        }
        // Firefox refuses to start a drag without data.
        e.dataTransfer.setData('text/plain', server);
        e.dataTransfer.effectAllowed = 'move';

        const order = visible.map((item) => item.uuid);
        dragStart.current = { order: order.join(), dropped: false };
        setDragging(server);
        setDragOrder(order);
    };

    const onDragEnter = (server: string) => {
        if (dragging && dragOrder) setDragOrder(moveItem(dragOrder, dragging, server));
    };

    // Dropping outside the list, or pressing Esc, discards the new order.
    const onDragEnd = () => {
        if (dragStart.current.dropped && dragOrder && dragOrder.join() !== dragStart.current.order) {
            save({ order: mergeOrder(dragOrder, preferences.order).slice(0, 500) });
        }
        setDragging(null);
        setDragOrder(null);
    };

    const showingOthers = showOnlyAdmin && rootAdmin;

    return (
        <PageContentBlock className='content-dashboard' title={'Dashboard'} showFlashKey={'dashboard'}>
            <div className={'mb-6 flex flex-wrap items-center justify-between gap-4'}>
                <div className={'min-w-0'}>
                    <h1 className={'flex items-center gap-3 text-2xl font-bold text-white'}>
                        <span className={styles.tile}>
                            <FontAwesomeIcon icon={faServer} />
                        </span>
                        {showingOthers ? "Others' servers" : 'Your servers'}
                        {servers && (
                            <span
                                className={
                                    'rounded-full bg-cs2-accent/20 px-2.5 py-0.5 text-sm font-semibold text-cs2-accent'
                                }
                            >
                                {servers.pagination.total}
                            </span>
                        )}
                    </h1>
                    <p className={'mt-1.5 text-sm text-white/50'}>
                        Open a server to manage it
                        <span className={'hidden sm:inline'}>, or drag the grip on its left to change the order</span>.
                    </p>
                </div>
                {rootAdmin && (
                    <div className={styles.segmented} role={'group'} aria-label={'Server list'}>
                        <button
                            type={'button'}
                            className={classNames(styles.segment, !showOnlyAdmin && styles.active)}
                            aria-pressed={!showOnlyAdmin}
                            onClick={() => setShowOnlyAdmin(false)}
                        >
                            Mine
                        </button>
                        <button
                            type={'button'}
                            className={classNames(styles.segment, showOnlyAdmin && styles.active)}
                            aria-pressed={showOnlyAdmin}
                            onClick={() => setShowOnlyAdmin(true)}
                        >
                            Others
                        </button>
                    </div>
                )}
            </div>
            {pool && <BulkActions pool={sortByOrder(pool.items, preferences.order)} onChange={revalidatePool} />}
            {!servers ? (
                <div className={'flex flex-col items-center gap-4 py-16'}>
                    <Spinner size={'large'} />
                    <p className={'text-sm text-white/50'}>Loading servers…</p>
                </div>
            ) : (
                <Pagination data={{ ...servers, items: visible }} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <>
                                {items.length > 1 && <ServerTotals servers={items} usage={usage} />}
                                <div
                                    className={classNames('space-y-3', items.length > 1 && 'mt-3')}
                                    onDragOver={(e) => {
                                        if (dragging) e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        dragStart.current.dropped = true;
                                    }}
                                >
                                    {items.map((server) => (
                                        <div
                                            key={server.uuid}
                                            data-server-row
                                            className={classNames(
                                                'transition-opacity',
                                                dragging === server.uuid && 'opacity-50'
                                            )}
                                            onDragEnter={() => onDragEnter(server.uuid)}
                                        >
                                            <ServerRow
                                                server={server}
                                                onUsage={onUsage}
                                                handle={
                                                    <div
                                                        draggable
                                                        title={'Drag to reorder'}
                                                        className={styles.handle}
                                                        onDragStart={(e) => onDragStart(e, server.uuid)}
                                                        onDragEnd={onDragEnd}
                                                    >
                                                        <FontAwesomeIcon icon={faGripVertical} />
                                                    </div>
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={'cs2-card flex flex-col items-center gap-3 px-6 py-10 text-center'}>
                                <span className={styles.tile}>
                                    <FontAwesomeIcon icon={faServer} />
                                </span>
                                <p className={'text-sm text-white/50'}>
                                    {showOnlyAdmin
                                        ? 'There are no other servers to display.'
                                        : 'There are no servers associated with your account.'}
                                </p>
                            </div>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
