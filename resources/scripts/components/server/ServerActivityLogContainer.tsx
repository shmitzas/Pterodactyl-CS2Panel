import React, { useEffect, useState } from 'react';
import { useActivityLogs } from '@/api/server/activity';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { ActivityLogFilters } from '@/api/account/activity';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { styles as btnStyles } from '@/components/elements/button/index';
import { XCircleIcon } from '@heroicons/react/solid';
import useLocationHash from '@/plugins/useLocationHash';
import PageHeader from '@/components/elements/PageHeader';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('server:activity');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });

    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <ServerContentBlock title={'Activity Log'}>
            <PageHeader
                icon={faHistory}
                title={'Activity'}
                description={'Everything done on this server, newest first. Click an event to filter by it.'}
            >
                {(filters.filters?.event || filters.filters?.ip) && (
                    <Link
                        to={'#'}
                        className={classNames(btnStyles.button, btnStyles.text, 'w-full sm:w-auto')}
                        onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                    >
                        Clear Filters <XCircleIcon className={'w-4 h-4 ml-2'} />
                    </Link>
                )}
            </PageHeader>
            <FlashMessageRender byKey={'server:activity'} className={'mb-4'} />
            {!data && isValidating ? (
                <Spinner centered />
            ) : !data?.items.length ? (
                <div className={'cs2-card cs2-empty'}>No activity logs available for this server.</div>
            ) : (
                <div className={'cs2-card px-2'}>
                    {data?.items.map((activity) => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            <span />
                        </ActivityLogEntry>
                    ))}
                </div>
            )}
            {data && (
                <PaginationFooter
                    pagination={data.pagination}
                    onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                />
            )}
        </ServerContentBlock>
    );
};
