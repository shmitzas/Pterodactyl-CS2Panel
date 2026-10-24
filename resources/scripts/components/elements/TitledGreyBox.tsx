import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import classNames from 'classnames';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div className={classNames('glass-panel', className)}>
        <div className={'border-b border-white/10 px-5 py-3.5'}>
            {typeof title === 'string' ? (
                <h2 className={'flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-white'}>
                    {icon && <FontAwesomeIcon icon={icon} className={'text-cs2-accent'} fixedWidth />}
                    {title}
                </h2>
            ) : (
                title
            )}
        </div>
        <div className={'p-5'}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
