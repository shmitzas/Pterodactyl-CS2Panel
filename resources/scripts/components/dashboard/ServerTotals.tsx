import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faLayerGroup, faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { Meter, percentOf, rowGrid, ServerUsage } from '@/components/dashboard/ServerRow';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import styles from './dashboard.module.css';

// A limit of 0 means unlimited, so one unlimited server makes the total unlimited.
const totalLimit = (servers: Server[], resource: 'cpu' | 'memory' | 'disk') =>
    servers.every((server) => server.limits[resource] > 0)
        ? servers.reduce((total, server) => total + server.limits[resource], 0)
        : 0;

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

    const percents = {
        cpu: cpu === undefined ? 0 : percentOf(cpu, cpuLimit),
        memory: memory === undefined ? 0 : percentOf(memory, memoryLimit),
        disk: disk === undefined ? 0 : percentOf(disk, diskLimit),
    };

    const tone = !live.length ? 'muted' : running === servers.length ? 'success' : running ? 'warning' : 'danger';

    return (
        <div className={styles.totals}>
            <div className={styles.totals_handle} />
            <div className={classNames(styles.totals_body, rowGrid)}>
                <div className={'flex min-w-0 items-center gap-3'}>
                    <span className={classNames(styles.tile, styles.small)}>
                        <FontAwesomeIcon icon={faLayerGroup} />
                    </span>
                    <div className={'min-w-0'}>
                        <p className={'truncate font-semibold text-white'}>All servers</p>
                        <p className={'truncate text-xs text-white/50'}>Totals for {servers.length} servers</p>
                    </div>
                </div>
                <div className={'hidden xl:block'} />
                <Meter
                    icon={faMicrochip}
                    title={'Total CPU'}
                    value={cpu === undefined ? undefined : `${cpu.toFixed(1)} %`}
                    limit={cpuLimit ? `${cpuLimit} %` : '∞'}
                    percent={percents.cpu}
                    alarm={percents.cpu >= 90}
                />
                <Meter
                    icon={faMemory}
                    title={'Total memory'}
                    value={memory === undefined ? undefined : bytesToString(memory)}
                    limit={memoryLimit ? bytesToString(memoryLimit) : '∞'}
                    percent={percents.memory}
                    alarm={percents.memory >= 90}
                />
                <Meter
                    icon={faHdd}
                    title={'Total disk'}
                    value={disk === undefined ? undefined : bytesToString(disk)}
                    limit={diskLimit ? bytesToString(diskLimit) : '∞'}
                    percent={percents.disk}
                    alarm={percents.disk >= 90}
                />
                <span
                    className={classNames(styles.badge, styles[`tone_${tone}`], 'justify-self-end text-2xs')}
                    title={`${running} of ${servers.length} servers running`}
                >
                    {running}/{servers.length} running
                </span>
            </div>
        </div>
    );
};
