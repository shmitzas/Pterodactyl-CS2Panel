import React, { memo } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faServer } from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { powerPill } from '@/components/server/powerState';
import { ip } from '@/lib/formatters';
import styles from './style.module.css';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return match ? `${match.alias || ip(match.ip)}:${match.port}` : null;
    });

    const power = powerPill(status);

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <div className={'cs2-notice cs2-tone-warn mb-6'} role={'status'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </div>
            )}
            <section className={classNames('cs2-card', styles.head)} aria-labelledby={'server-title'}>
                <span className={'cs2-tile cs2-tile--lg cs2-tone-accent'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faServer} />
                </span>
                <div className={styles.head_text}>
                    <h1 className={styles.head_title} id={'server-title'}>
                        {name}
                    </h1>
                    {description && <p className={styles.head_desc}>{description}</p>}
                    <div className={styles.head_meta}>
                        <span className={classNames('cs2-pill', power.tone)}>
                            <span className={'cs2-pill-dot'} />
                            {power.label}
                        </span>
                        {allocation && (
                            <span className={'cs2-addr'} title={'Default allocation'}>
                                <code>{allocation}</code>
                                <CopyOnClick text={allocation}>
                                    <button
                                        type={'button'}
                                        className={'cs2-icon-btn'}
                                        aria-label={'Copy the server address'}
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                </CopyOnClick>
                            </span>
                        )}
                    </div>
                </div>
                <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                    <PowerButtons className={styles.power} />
                </Can>
            </section>
            <div className={styles.grid}>
                <Spinner.Suspense>
                    <Console />
                </Spinner.Suspense>
                <ServerDetailsBlock />
            </div>
            <section className={styles.charts} aria-label={'Usage over the recent readings'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </section>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);