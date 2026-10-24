import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div className={'flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4'}>{children}</div>
        );
    }, [children]);

    return null;
};
