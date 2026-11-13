import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faCrosshairs,
    faLayerGroup,
    faShieldAlt,
    faSignOutAlt,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import classNames from 'classnames';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import { toggleSidebar } from '@/components/Sidebar';
import styles from './NavigationBar.module.css';

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { pathname } = useLocation();

    // Server and account pages have a sidebar; the bar spans the same frame as the page below it.
    const withSidebar = pathname.startsWith('/server') || pathname.startsWith('/account');

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <header className={classNames(styles.bar, !withSidebar && styles.narrow)}>
            <SpinnerOverlay visible={isLoggingOut} fixed />
            {withSidebar && (
                <button
                    type={'button'}
                    className={classNames(styles.icon_button, styles.menu)}
                    aria-label={'Sections'}
                    aria-controls={'sidebar'}
                    aria-expanded={'false'}
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            )}
            <Link to={'/'} className={styles.brand}>
                <span className={'cs2-brand-mark'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faCrosshairs} />
                </span>
                <span className={styles.name}>{name}</span>
            </Link>
            <SearchContainer className={styles.search} />
            <nav className={styles.links} aria-label={'Panel'}>
                <NavLink to={'/'} exact className={styles.link}>
                    <FontAwesomeIcon icon={faLayerGroup} fixedWidth />
                    Servers
                </NavLink>
                <NavLink to={'/account'} className={styles.link}>
                    <FontAwesomeIcon icon={faUser} fixedWidth />
                    Account
                </NavLink>
                {user.rootAdmin && (
                    <a href={'/admin'} className={styles.link}>
                        <FontAwesomeIcon icon={faShieldAlt} fixedWidth />
                        Admin
                    </a>
                )}
            </nav>
            <span className={styles.user}>
                <span className={styles.avatar} aria-hidden={'true'}>
                    <Avatar.User />
                </span>
                <span className={styles.username}>{user.username}</span>
            </span>
            <Tooltip placement={'bottom'} content={'Sign out'}>
                <button
                    type={'button'}
                    className={classNames(styles.icon_button, styles.logout)}
                    aria-label={'Sign out'}
                    onClick={onTriggerLogout}
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
            </Tooltip>
        </header>
    );
};
