import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faBan,
    faCircleNotch,
    faDownload,
    faExchangeAlt,
    faHdd,
    faHistory,
    faMemory,
    faMicrochip,
    faNetworkWired,
    faPlay,
    faPlug,
    faPowerOff,
    faQuestionCircle,
    faServer,
    faSyncAlt,
    faTools,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import styles from './dashboard.module.css';

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

export const percentOf = (value: number, limit: number) => (limit > 0 ? Math.min(100, (value / limit) * 100) : 0);

// Shared with the totals strip so its columns line up with the rows.
export const rowGrid = classNames(
    'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4',
    'md:grid-cols-[minmax(0,1fr)_repeat(3,6.5rem)_7.5rem]',
    'lg:grid-cols-[minmax(0,1fr)_repeat(3,9rem)_7.5rem]',
    'xl:grid-cols-[minmax(0,1fr)_12rem_repeat(3,9rem)_7.5rem] xl:gap-3'
);

export interface ServerUsage {
    // Null while suspended or before the first successful poll.
    stats: ServerStats | null;
    running: boolean;
}

interface State {
    label: string;
    tone: 'info' | 'success' | 'warning' | 'danger' | 'muted';
    icon: IconDefinition;
    spin?: boolean;
    pulse?: boolean;
}

const powerStates: Record<ServerPowerState, State> = {
    running: { label: 'Running', tone: 'success', icon: faPlay, pulse: true },
    starting: { label: 'Starting', tone: 'warning', icon: faSyncAlt, spin: true },
    stopping: { label: 'Stopping', tone: 'warning', icon: faSyncAlt, spin: true },
    offline: { label: 'Offline', tone: 'danger', icon: faPowerOff },
};

interface MeterProps {
    icon: IconDefinition;
    title: string;
    value?: string;
    limit: string;
    percent: number;
    alarm: boolean;
}

export const Meter = ({ icon, title, value, limit, percent, alarm }: MeterProps) => (
    <div className={'hidden min-w-0 md:block'} title={`${title}: ${value ?? '—'} / ${limit}`}>
        <p className={'flex items-baseline gap-1.5 text-sm'}>
            <FontAwesomeIcon icon={icon} className={'self-center text-xs text-cs2-accent'} fixedWidth />
            <span className={classNames('whitespace-nowrap', alarm ? 'font-semibold text-cs2-danger' : 'text-white')}>
                {value ?? '—'}
            </span>
            <span className={'hidden truncate text-xs text-white/40 lg:inline'}>/ {limit}</span>
        </p>
        <div className={classNames(styles.meter, 'mt-1.5')}>
            <div className={classNames(styles.meter_fill, alarm && styles.alarm)} style={{ width: `${percent}%` }} />
        </div>
    </div>
);

type Timer = ReturnType<typeof setInterval>;

interface Props {
    server: Server;
    className?: string;
    // Rendered inside the card but outside the link, e.g. the drag handle.
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

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : '∞';

    const live = stats && !isSuspended ? stats : null;
    const allocation = server.allocations
        .filter((alloc) => alloc.isDefault)
        .map((alloc) => `${alloc.alias || ip(alloc.ip)}:${alloc.port}`)
        .join(', ');

    const state: State = isSuspended
        ? { label: 'Suspended', tone: 'danger', icon: faBan }
        : server.isNodeUnderMaintenance
        ? { label: 'Maintenance', tone: 'warning', icon: faTools }
        : server.isTransferring
        ? { label: 'Transferring', tone: 'info', icon: faExchangeAlt }
        : server.status === 'installing'
        ? { label: 'Installing', tone: 'info', icon: faDownload }
        : server.status === 'restoring_backup'
        ? { label: 'Restoring', tone: 'info', icon: faHistory }
        : server.status
        ? { label: 'Unavailable', tone: 'muted', icon: faQuestionCircle }
        : stats
        ? powerStates[stats.status]
        : unreachable
        ? { label: 'Unreachable', tone: 'muted', icon: faPlug }
        : { label: 'Loading', tone: 'muted', icon: faCircleNotch, spin: true };
    const tone = styles[`tone_${state.tone}`];
    const running = state === powerStates.running;

    useEffect(() => {
        onUsage?.(server.uuid, { stats: live, running });
    }, [server.uuid, live, running]);

    return (
        <div className={classNames('glass-card', styles.row, className)}>
            {handle}
            <Link to={`/server/${server.id}`} className={classNames(styles.link, rowGrid)}>
                <div className={'flex min-w-0 items-center gap-3'}>
                    <span className={styles.tile}>
                        <FontAwesomeIcon icon={faServer} />
                    </span>
                    <div className={'min-w-0'}>
                        <p className={'flex items-center gap-2'}>
                            <span className={classNames(styles.dot, tone, state.pulse && styles.pulse)} />
                            <span className={'truncate font-semibold text-white'}>{server.name}</span>
                        </p>
                        {!!server.description && (
                            <p className={'mt-0.5 truncate text-sm text-white/50'}>{server.description}</p>
                        )}
                    </div>
                </div>
                <div className={'hidden min-w-0 xl:block'}>
                    <span className={classNames(styles.ip, 'font-mono text-xs')} title={'Default allocation'}>
                        <FontAwesomeIcon icon={faNetworkWired} className={'opacity-70'} />
                        <span className={'truncate'}>{allocation}</span>
                    </span>
                </div>
                <Meter
                    icon={faMicrochip}
                    title={'CPU'}
                    value={live ? `${live.cpuUsagePercent.toFixed(1)} %` : undefined}
                    limit={cpuLimit}
                    percent={live ? percentOf(live.cpuUsagePercent, server.limits.cpu) : 0}
                    alarm={alarms.cpu}
                />
                <Meter
                    icon={faMemory}
                    title={'Memory'}
                    value={live ? bytesToString(live.memoryUsageInBytes) : undefined}
                    limit={memoryLimit}
                    percent={live ? percentOf(live.memoryUsageInBytes, mbToBytes(server.limits.memory)) : 0}
                    alarm={alarms.memory}
                />
                <Meter
                    icon={faHdd}
                    title={'Disk'}
                    value={live ? bytesToString(live.diskUsageInBytes) : undefined}
                    limit={diskLimit}
                    percent={live ? percentOf(live.diskUsageInBytes, mbToBytes(server.limits.disk)) : 0}
                    alarm={alarms.disk}
                />
                <span className={classNames(styles.badge, tone, 'justify-self-end text-2xs')}>
                    <FontAwesomeIcon icon={state.icon} spin={state.spin} />
                    {state.label}
                </span>
            </Link>
        </div>
    );
};
