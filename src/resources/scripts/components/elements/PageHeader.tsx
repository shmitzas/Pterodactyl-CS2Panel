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
    <div className={'cs2-page-head is-centered'}>
        <div className={'flex min-w-0 items-center gap-3'}>
            <span className={'cs2-tile cs2-tone-accent'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <div className={'cs2-page-head-text'}>
                <h1 className={'cs2-page-title'}>{title}</h1>
                {description && <p className={'cs2-page-sub text-sm'}>{description}</p>}
            </div>
        </div>
        {children && <div className={'flex w-full flex-wrap items-center gap-2 sm:w-auto'}>{children}</div>}
    </div>
);
