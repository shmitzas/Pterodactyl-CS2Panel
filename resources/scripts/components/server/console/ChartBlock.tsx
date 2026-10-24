import React from 'react';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
    <div className={'glass-panel group overflow-hidden pt-2'}>
        <div className={'flex items-center justify-between px-4 py-2'}>
            <h3
                className={
                    'text-xs font-semibold uppercase tracking-wider text-white/60 transition-colors duration-150 group-hover:text-white'
                }
            >
                {title}
            </h3>
            {legend && <p className={'text-sm flex items-center'}>{legend}</p>}
        </div>
        <div className={'z-10 ml-2'}>{children}</div>
    </div>
);
