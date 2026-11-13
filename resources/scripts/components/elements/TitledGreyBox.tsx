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
    <div className={classNames('cs2-card cs2-tone-accent', className)}>
        <div className={'cs2-card-head'}>
            {typeof title === 'string' ? (
                <>
                    {icon && (
                        <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                            <FontAwesomeIcon icon={icon} />
                        </span>
                    )}
                    <h2 className={'cs2-card-title'}>{title}</h2>
                </>
            ) : (
                title
            )}
        </div>
        <div className={'cs2-card-body'}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);