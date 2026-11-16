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
            'border-accent/30 bg-accent/15 text-accent-text': !dark,
            'border-rule bg-paper-3 text-ink-2': dark,
        })}
    >
        {children}
    </code>
);
