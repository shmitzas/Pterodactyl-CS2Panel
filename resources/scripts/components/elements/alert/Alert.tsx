import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

export default ({ type, className, children }: AlertProps) => {
    return (
        <div
            className={classNames(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-white/90',
                {
                    ['border-cs2-danger/40 bg-cs2-danger/10']: type === 'danger',
                    ['border-cs2-warning/40 bg-cs2-warning/10']: type === 'warning',
                },
                className
            )}
        >
            {type === 'danger' ? (
                <ShieldExclamationIcon className={'h-5 w-5 shrink-0 text-cs2-danger'} />
            ) : (
                <ExclamationIcon className={'h-5 w-5 shrink-0 text-cs2-warning'} />
            )}
            {children}
        </div>
    );
};
