import React from 'react';
import classNames from 'classnames';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './style.module.css';

interface ChartBlockProps {
    title: string;
    tone: 'cpu' | 'mem' | 'net';
    icon: IconDefinition;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, tone, icon, legend, children }: ChartBlockProps) => (
    <article className={classNames('cs2-card', `cs2-tone-${tone}`)} aria-label={title}>
        <div className={'cs2-card-head'}>
            <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <div className={'cs2-card-titles'}>
                <h2 className={'cs2-card-title'}>{title}</h2>
                <p className={'cs2-card-sub'}>Live</p>
            </div>
            {legend && <div className={styles.legend}>{legend}</div>}
        </div>
        <div className={'cs2-card-body'}>
            <div className={styles.chart}>{children}</div>
        </div>
    </article>
);