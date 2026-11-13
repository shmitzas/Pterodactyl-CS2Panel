import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHdd, faHeartbeat, faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { ServerUsage } from '@/components/dashboard/ServerRow';
import { percentOf, usageBand } from '@/lib/usage';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import styles from './dashboard.module.css';

// A limit of 0 means unlimited, so one unlimited server makes the total unlimited.
const totalLimit = (servers: Server[], resource: 'cpu' | 'memory' | 'disk') =>
    servers.every((server) => server.limits[resource] > 0)
        ? servers.reduce((total, server) => total + server.limits[resource], 0)
        : 0;

interface StatProps {
    tone: string;
    icon: IconDefinition;
    title: string;
    note: string;
    value: React.ReactNode;
    percent: number;
    banded?: boolean;
}

const Stat = ({ tone, icon, title, note, value, percent, banded = true }: StatProps) => (
    <div className={classNames('cs2-card', styles.stat, `cs2-tone-${tone}`)}>
        <dt className={styles.stat_head}>
            <span className={'cs2-tile'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <span className={styles.stat_label}>
                <b>{title}</b>
                <span>{note}</span>
            </span>
        </dt>
        <dd className={styles.stat_value}>
            <span className={styles.big}>{value}</span>
            <span className={classNames('cs2-meter', banded && usageBand(percent))} aria-hidden={'true'}>
                <span style={{ '--v': percent / 100 } as React.CSSProperties} />
            </span>
        </dd>
    </div>
);

interface Props {
    servers: Server[];
    usage: Record<string, ServerUsage | undefined>;
}

export default ({ servers, usage }: Props) => {
    const reports = servers.map((server) => usage[server.uuid]).filter((item): item is ServerUsage => !!item);
    const live = reports.map((item) => item.stats).filter((stats): stats is ServerStats => !!stats);
    const running = reports.filter((item) => item.running).length;

    const sum = (pick: (stats: ServerStats) => number) =>
        live.length ? live.reduce((total, stats) => total + pick(stats), 0) : undefined;

    const cpu = sum((stats) => stats.cpuUsagePercent);
    const memory = sum((stats) => stats.memoryUsageInBytes);
    const disk = sum((stats) => stats.diskUsageInBytes);

    const cpuLimit = totalLimit(servers, 'cpu');
    const memoryLimit = mbToBytes(totalLimit(servers, 'memory'));
    const diskLimit = mbToBytes(totalLimit(servers, 'disk'));

    const count = (status: ServerStats['status']) => live.filter((stats) => stats.status === status).length;
    const breakdown = (
        [
            [count('starting'), 'starting'],
            [count('stopping'), 'stopping'],
            [count('offline'), 'offline'],
            [servers.length - live.length, 'unavailable'],
        ] as [number, string][]
    )
        .filter(([total]) => total > 0)
        .map(([total, label]) => `${total} ${label}`)
        .join(', ');

    const runningTone = !live.length ? 'off' : running === servers.length ? 'ok' : running ? 'warn' : 'bad';

    return (
        <dl className={styles.totals} aria-label={`Totals for ${servers.length} servers`}>
            <Stat
                tone={runningTone}
                icon={faHeartbeat}
                title={'Running'}
                note={!reports.length ? 'Loading…' : breakdown || 'All running'}
                value={
                    <>
                        {running} <small>of {servers.length}</small>
                    </>
                }
                percent={percentOf(running, servers.length)}
                banded={false}
            />
            <Stat
                tone={'cpu'}
                icon={faMicrochip}
                title={'CPU'}
                note={cpuLimit ? `Limit ${cpuLimit}%` : 'No limit'}
                value={cpu === undefined ? '—' : `${cpu.toFixed(1)}%`}
                percent={cpu === undefined ? 0 : percentOf(cpu, cpuLimit)}
            />
            <Stat
                tone={'mem'}
                icon={faMemory}
                title={'Memory'}
                note={memoryLimit ? `Limit ${bytesToString(memoryLimit)}` : 'No limit'}
                value={memory === undefined ? '—' : bytesToString(memory)}
                percent={memory === undefined ? 0 : percentOf(memory, memoryLimit)}
            />
            <Stat
                tone={'disk'}
                icon={faHdd}
                title={'Disk'}
                note={diskLimit ? `Limit ${bytesToString(diskLimit)}` : 'No limit'}
                value={disk === undefined ? '—' : bytesToString(disk)}
                percent={disk === undefined ? 0 : percentOf(disk, diskLimit)}
            />
        </dl>
    );
};