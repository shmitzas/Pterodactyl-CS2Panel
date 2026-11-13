import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

export default ({ type, className, children }: AlertProps) => (
    <div className={classNames('cs2-notice', type === 'danger' ? 'cs2-tone-bad' : 'cs2-tone-warn', className)}>
        {type === 'danger' ? (
            <ShieldExclamationIcon className={'h-5 w-5 shrink-0 cs2-tone-text'} />
        ) : (
            <ExclamationIcon className={'h-5 w-5 shrink-0 cs2-tone-text'} />
        )}
        <div className={'min-w-0 flex-1'}>{children}</div>
    </div>
);