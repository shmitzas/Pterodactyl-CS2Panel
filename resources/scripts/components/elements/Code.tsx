import React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark, className, children }: CodeProps) => (
    <code
        className={classNames('inline-block rounded-md border px-2 py-0.5 font-mono text-sm', className, {
            'border-cs2-accent/20 bg-cs2-accent/10 text-cs2-accent': !dark,
            'border-white/10 bg-black/40 text-white/90': dark,
        })}
    >
        {children}
    </code>
);
