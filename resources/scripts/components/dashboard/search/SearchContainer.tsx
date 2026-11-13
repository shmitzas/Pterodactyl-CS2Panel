import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';

const isMac = /mac/i.test(navigator.platform);

export default ({ className }: { className?: string }) => {
    const [visible, setVisible] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (visible || ['input', 'textarea'].includes(((e.target as HTMLElement).tagName || 'input').toLowerCase())) {
            return;
        }

        const key = e.key.toLowerCase();
        if ((e.metaKey && key === '/') || ((isMac ? e.metaKey : e.ctrlKey) && key === 'k')) {
            e.preventDefault();
            setVisible(true);
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <button type={'button'} className={className} aria-label={'Search servers'} onClick={() => setVisible(true)}>
                <FontAwesomeIcon icon={faSearch} />
                <span>Search servers</span>
                <kbd aria-hidden={'true'}>{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
            </button>
        </>
    );
};