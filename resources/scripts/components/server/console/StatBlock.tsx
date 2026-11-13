import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

export type StatTone = 'success' | 'warning' | 'danger';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    tone?: StatTone;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

const bars: Record<StatTone, string> = {
    success: 'bg-cs2-success',
    warning: 'bg-cs2-warning',
    danger: 'bg-cs2-danger',
};

export default ({ title, copyOnClick, icon, tone, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames(styles.stat_block, className)}>
                <div className={classNames(styles.status_bar, tone ? bars[tone] : 'bg-white/10')} />
                <div className={classNames('cs2-tile', styles.icon, tone && `cs2-tone-${tone}`)}>
                    <Icon icon={icon} />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'text-2xs font-semibold uppercase tracking-wider text-white/50 md:text-xs'}>
                        {title}
                    </p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full font-semibold text-white truncate'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
