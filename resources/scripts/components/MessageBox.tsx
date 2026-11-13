import * as React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import styles from './MessageBox.module.css';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const icons = {
    success: faCheckCircle,
    info: faInfoCircle,
    warning: faExclamationTriangle,
    error: faExclamationCircle,
};

const MessageBox = ({ title, children, type = 'info' }: Props) => (
    <div className={classNames(styles.box, styles[type])} role={'alert'}>
        <span className={styles.icon}>
            <FontAwesomeIcon icon={icons[type]} />
        </span>
        <p className={'min-w-0 flex-1 text-sm text-ink-2'}>
            {title && <span className={'mr-2 font-semibold text-ink'}>{title}</span>}
            {children}
        </p>
    </div>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
