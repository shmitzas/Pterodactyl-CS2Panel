import React, { useEffect, useState } from 'react';
import getServerDatabases from '@/api/server/databases/getServerDatabases';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import DatabaseRow from '@/components/server/databases/DatabaseRow';
import Spinner from '@/components/elements/Spinner';
import CreateDatabaseButton from '@/components/server/databases/CreateDatabaseButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import PageHeader from '@/components/elements/PageHeader';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useDeepMemoize } from '@/plugins/useDeepMemoize';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);

    const databases = useDeepMemoize(ServerContext.useStoreState((state) => state.databases.data));
    const setDatabases = ServerContext.useStoreActions((state) => state.databases.setDatabases);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');

        getServerDatabases(uuid)
            .then((databases) => setDatabases(databases))
            .catch((error) => {
                console.error(error);
                addError({ key: 'databases', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <ServerContentBlock title={'Databases'}>
            <PageHeader
                icon={faDatabase}
                title={'Databases'}
                description={
                    databaseLimit > 0
                        ? `${databases.length} of ${databaseLimit} databases have been allocated to this server.`
                        : 'Databases cannot be created for this server.'
                }
            >
                {databaseLimit > 0 && databaseLimit !== databases.length && (
                    <Can action={'database.create'}>
                        <CreateDatabaseButton />
                    </Can>
                )}
            </PageHeader>
            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />
            {!databases.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <Fade timeout={150}>
                    <>
                        {databases.length > 0 ? (
                            databases.map((database, index) => (
                                <DatabaseRow
                                    key={database.id}
                                    database={database}
                                    className={index > 0 ? 'mt-2' : undefined}
                                />
                            ))
                        ) : (
                            <div className={'cs2-card cs2-empty'}>
                                {databaseLimit > 0
                                    ? 'It looks like you have no databases.'
                                    : 'Databases cannot be created for this server.'}
                            </div>
                        )}
                    </>
                </Fade>
            )}
        </ServerContentBlock>
    );
};
