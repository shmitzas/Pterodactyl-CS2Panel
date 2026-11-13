import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import classNames from 'classnames';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import styles from './NavigationBar.module.css';

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/server') || location.pathname.startsWith('/account')) {
            setShowSidebar(true);
            return;
        }
        setShowSidebar(false);
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={classNames('topbar overflow-x-auto', styles.bar)}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto flex h-full w-full max-w-[1200px] items-center gap-4 px-4'}>
                {showSidebar && (
                    <button
                        type={'button'}
                        className={classNames(styles.link, styles.menu)}
                        aria-label={'Toggle navigation'}
                        aria-controls={'sidebar'}
                        onClick={onTriggerNavButton}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                )}

                <div id={'logo'} className={'flex min-w-0 flex-1'}>
                    <Link to={'/'} className={styles.brand} aria-label={name}>
                        <span className={styles.mark} aria-hidden={'true'} />
                        <span className={'truncate text-lg font-bold tracking-wide'}>{name}</span>
                    </Link>
                </div>

                <nav className={styles.links}>
                    <SearchContainer className={styles.link} />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact className={styles.link} aria-label={'Dashboard'}>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'} className={styles.link} aria-label={'Admin'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'} className={styles.link} aria-label={'Account Settings'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button
                            type={'button'}
                            className={classNames(styles.link, styles.logout)}
                            aria-label={'Sign Out'}
                            onClick={onTriggerLogout}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </nav>
            </div>
        </div>
    );
};
