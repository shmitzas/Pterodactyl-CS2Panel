import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import Sidebar, { SidebarSection } from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export default () => {
    const location = useLocation();

    const content = (
        <TransitionRouter>
            <React.Suspense fallback={<Spinner centered />}>
                <Switch location={location}>
                    <Route path={'/'} exact>
                        <DashboardContainer />
                    </Route>
                    {routes.account.map(({ path, component: Component }) => (
                        <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                            <Component />
                        </Route>
                    ))}
                    <Route path={'*'}>
                        <NotFound />
                    </Route>
                </Switch>
            </React.Suspense>
        </TransitionRouter>
    );

    return (
        <>
            <NavigationBar />
            {location.pathname.startsWith('/account') ? (
                <div className={'cs2-shell'}>
                    <Sidebar label={'Account'}>
                        <SidebarSection label={'Account settings'}>
                            {routes.account
                                .filter((route) => !!route.name)
                                .map(({ path, name, exact = false, iconProp }) => (
                                    <NavLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
                                        <span className={'icon'}>
                                            <FontAwesomeIcon icon={iconProp as IconProp} />
                                        </span>
                                        {name}
                                    </NavLink>
                                ))}
                        </SidebarSection>
                    </Sidebar>
                    <main className={'cs2-main'}>{content}</main>
                </div>
            ) : (
                <main className={'cs2-page'}>{content}</main>
            )}
        </>
    );
};
