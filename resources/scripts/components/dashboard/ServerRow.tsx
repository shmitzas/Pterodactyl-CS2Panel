import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCopy, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { percentOf, usageBand } from '@/lib/usage';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { isPrereleaseOn } from '@/components/dashboard/BulkActions';
import styles from './dashboard.module.css';

export interface ServerUsage {
    // Null while suspended or before the first successful poll.
    stats: ServerStats | null;
    running: boolean;
}

export type Tone = 'accent' | 'ok' | 'warn' | 'bad' | 'off';

interface State {
    label: string;
    tone: Tone;
}

const powerStates: Record<ServerPowerState, State> = {
    running: { label: 'Running', tone: 'ok' },
    starting: { label: 'Starting', tone: 'warn' },
    stopping: { label: 'Stopping', tone: 'warn' },
    offline: { label: 'Offline', tone: 'bad' },
};

interface MeterProps {
    tone: 'cpu' | 'mem' | 'disk';
    title: string;
    value?: string;
    limit: string;
    percent: number;
    className?: string;
}

export const Meter = ({ tone, title, value, limit, percent, className }: MeterProps) => {
    const band = value === undefined ? undefined : usageBand(percent);

    return (
        <div className={classNames('cs2-metric', `cs2-tone-${tone}`, className)}>
            <div className={'cs2-metric-top'}>
                <span className={'cs2-metric-label'}>{title}</span>
                <span className={classNames('cs2-metric-value', band === 'is-high' && 'is-high')}>
                    {value ?? '—'} <small>/ {limit}</small>
                </span>
            </div>
            <span className={classNames('cs2-meter', band)} aria-hidden={'true'}>
                <span style={{ '--v': percent / 100 } as React.CSSProperties} />
            </span>
        </div>
    );
};

type Timer = ReturnType<typeof setInterval>;

interface Props {
    server: Server;
    className?: string;
    // Rendered inside the card above its stretched link, e.g. the drag handle.
    handle?: React.ReactNode;
    onUsage?: (uuid: string, usage: ServerUsage) => void;
}

export default ({ server, className, handle, onUsage }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [unreachable, setUnreachable] = useState(false);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => {
                setStats(data);
                setUnreachable(false);
            })
            .catch((error) => {
                console.error(error);
                setUnreachable(true);
            });

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        // Don't waste a HTTP request if there is nothing important to show to the user because
        // the server is suspended.
        if (isSuspended || server.isNodeUnderMaintenance) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : '∞';

    const live = stats && !isSuspended ? stats : null;
    const allocation = server.allocations
        .filter((alloc) => alloc.isDefault)
        .map((alloc) => `${alloc.alias || ip(alloc.ip)}:${alloc.port}`)
        .join(', ');

    const state: State = isSuspended
        ? { label: 'Suspended', tone: 'bad' }
        : server.isNodeUnderMaintenance
        ? { label: 'Maintenance', tone: 'warn' }
        : server.isTransferring
        ? { label: 'Transferring', tone: 'accent' }
        : server.status === 'installing'
        ? { label: 'Installing', tone: 'accent' }
        : server.status === 'restoring_backup'
        ? { label: 'Restoring', tone: 'accent' }
        : server.status
        ? { label: 'Unavailable', tone: 'off' }
        : stats
        ? powerStates[stats.status]
        : unreachable
        ? { label: 'Unreachable', tone: 'off' }
        : { label: 'Loading', tone: 'off' };
    const running = state === powerStates.running;

    useEffect(() => {
        onUsage?.(server.uuid, { stats: live, running });
    }, [server.uuid, live, running]);

    return (
        <div className={classNames('cs2-card', styles.row, className)}>
            {handle}
            <div className={styles.who}>
                <span className={'cs2-tile cs2-tone-accent'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faServer} />
                </span>
                <div className={styles.who_text}>
                    <div className={styles.who_line}>
                        <Link to={`/server/${server.id}`} className={styles.name}>
                            {server.name}
                        </Link>
                        {isPrereleaseOn(server) && <span className={'cs2-tag cs2-tone-accent'}>Pre-release</span>}
                    </div>
                    {!!server.description && <span className={styles.desc}>{server.description}</span>}
                </div>
            </div>
            <div className={styles.addr}>
                {allocation && (
                    <span className={'cs2-addr'} title={'Default allocation'}>
                        <code>{allocation}</code>
                        <CopyOnClick text={allocation}>
                            <button
                                type={'button'}
                                className={'cs2-icon-btn'}
                                aria-label={`Copy the address of ${server.name}`}
                            >
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                        </CopyOnClick>
                    </span>
                )}
            </div>
            <Meter
                className={styles.cpu}
                tone={'cpu'}
                title={'CPU'}
                value={live ? `${live.cpuUsagePercent.toFixed(1)}%` : undefined}
                limit={cpuLimit}
                percent={live ? percentOf(live.cpuUsagePercent, server.limits.cpu) : 0}
            />
            <Meter
                className={styles.mem}
                tone={'mem'}
                title={'Memory'}
                value={live ? bytesToString(live.memoryUsageInBytes) : undefined}
                limit={memoryLimit}
                percent={live ? percentOf(live.memoryUsageInBytes, mbToBytes(server.limits.memory)) : 0}
            />
            <Meter
                className={styles.disk}
                tone={'disk'}
                title={'Disk'}
                value={live ? bytesToString(live.diskUsageInBytes) : undefined}
                limit={diskLimit}
                percent={live ? percentOf(live.diskUsageInBytes, mbToBytes(server.limits.disk)) : 0}
            />
            <span className={classNames('cs2-pill', `cs2-tone-${state.tone}`, styles.state)}>
                <span className={'cs2-pill-dot'} />
                {state.label}
            </span>
            <FontAwesomeIcon icon={faChevronRight} className={styles.go} aria-hidden={'true'} />
        </div>
    );
};
