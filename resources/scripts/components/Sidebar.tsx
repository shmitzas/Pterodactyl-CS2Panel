import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const OPEN_CLASS = 'active-nav';

const setSidebarOpen = (open: boolean) => {
    document.getElementById('sidebar')?.classList.toggle(OPEN_CLASS, open);
    document
        .querySelectorAll('[aria-controls="sidebar"]')
        .forEach((button) => button.setAttribute('aria-expanded', String(open)));
};

export const toggleSidebar = () =>
    setSidebarOpen(!document.getElementById('sidebar')?.classList.contains(OPEN_CLASS));

interface Props {
    label?: string;
    children: ReactNode;
}

export default ({ label, children }: Props) => {
    const { pathname, hash } = useLocation();

    // The mobile drawer covers the page, so close it once a link has been followed.
    useEffect(() => setSidebarOpen(false), [pathname, hash]);

    useEffect(() => {
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Element | null;
            if (!target?.closest('#sidebar, [aria-controls="sidebar"]')) setSidebarOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <nav className={'sidebar'} id={'sidebar'} aria-label={label || 'Sections'}>
            {children}
        </nav>
    );
};

interface SectionProps {
    label: string;
    children: ReactNode;
}

export const SidebarSection = ({ label, children }: SectionProps) => {
    const id = `sidebar-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
        <div className={'sidebar-section'} role={'group'} aria-labelledby={id}>
            <p className={'sidebar-label'} id={id}>
                {label}
            </p>
            {children}
        </div>
    );
};
