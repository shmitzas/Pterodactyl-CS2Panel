import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Props {
    icon: IconProp;
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
}

// Title row shared by the server pages; children render as right-aligned actions.
export default ({ icon, title, description, children }: Props) => (
    <div className={'mb-6 flex flex-wrap items-center justify-between gap-4'}>
        <div className={'flex min-w-0 items-center gap-3'}>
            <span className={'cs2-tile'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <div className={'min-w-0'}>
                <h1 className={'truncate text-2xl font-bold text-white'}>{title}</h1>
                {description && <p className={'mt-0.5 text-sm text-white/50'}>{description}</p>}
            </div>
        </div>
        {children && <div className={'flex w-full flex-wrap items-center gap-2 sm:w-auto'}>{children}</div>}
    </div>
);
