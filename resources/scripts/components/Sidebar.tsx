import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '@/assets/css/sidebar.css';

type ParentProps = {
    children: ReactNode;
};

export default ({ children }: Omit<ParentProps, 'render'>) => {
    const { pathname, hash } = useLocation();

    // The mobile drawer covers the page, so close it once a link has been followed.
    useEffect(() => {
        document.getElementById('sidebar')?.classList.remove('active-nav');
    }, [pathname, hash]);

    return (
        <nav className='sidebar' id='sidebar' aria-label={'Sections'}>
            {children}
        </nav>
    );
};
