import React, { useEffect, useMemo, useState } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faHdd, faMemory, faMicrochip, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { capitalize } from '@/lib/strings';
import { percentOf, usageBand } from '@/lib/usage';
import styles from './style.module.css';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const SAMPLES = 30;

const push = (values: number[], value: number) => [...values, value].slice(-SAMPLES);

// A sparkline scaled to its own range, so a steady load still shows its movement and a flat one sits mid-height.
const Spark = ({ values, label }: { values: number[]; label: string }) => {
    if (values.length < 2) {
        return <svg className={styles.spark} viewBox={'0 0 120 30'} aria-hidden={'true'} />;
    }

    const low = Math.min(...values);
    const high = Math.max(...values);
    const pad = Math.max((high - low) * 0.25, high * 0.05, 1e-9);
    const bottom = Math.max(0, low - pad);
    const span = high + pad - bottom;
    const step = 120 / (SAMPLES - 1);
    const offset = SAMPLES - values.length;
    const points = values.map((value, index) => {
        const x = ((offset + index) * step).toFixed(1);
        const y = (29 - ((value - bottom) / span) * 27).toFixed(1);

        return `${x} ${y}`;
    });
    const line = `M${points.join(' L')}`;

    return (
        <svg
            className={styles.spark}
            viewBox={'0 0 120 30'}
            preserveAspectRatio={'none'}
            role={'img'}
            aria-label={label}
        >
            <path className={styles.spark_fill} d={`${line} L120 30 L${(offset * step).toFixed(1)} 30 Z`} />
            <path className={styles.spark_line} d={line} />
        </svg>
    );
};

interface MiniProps {
    tone: string;
    icon: IconDefinition;
    title: string;
    note: string;
    value?: React.ReactNode;
    valueClassName?: string;
    children?: React.ReactNode;
}

const Mini = ({ tone, icon, title, note, value, valueClassName, children }: MiniProps) => (
    <div className={classNames('cs2-card', styles.mini, `cs2-tone-${tone}`)}>
        <dt className={styles.mini_label}>
            <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <span>
                {title}
                <small>{note}</small>
            </span>
        </dt>
        {value !== undefined && <dd className={classNames(styles.mini_value, valueClassName)}>{value}</dd>}
        {children && <dd className={styles.mini_extra}>{children}</dd>}
    </div>
);

const bandClass = (percent: number) => {
    const band = usageBand(percent);

    return band === 'is-high' ? styles.mini_high : band === 'is-warn' ? styles.mini_warn : undefined;
};

const uptimeTones: Record<string, string> = {
    running: 'ok',
    starting: 'warn',
    stopping: 'warn',
    offline: 'bad',
};

export default () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const [history, setHistory] = useState<{ cpu: number[]; memory: number[] }>({ cpu: [], memory: [] });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `of ${limits.cpu}%` : 'no limit',
            memory: limits?.memory ? `of ${bytesToString(mbToBytes(limits.memory))}` : 'no limit',
            disk: limits?.disk ? `of ${bytesToString(mbToBytes(limits.disk))}` : 'no limit',
        }),
        [limits]
    );

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useEffect(() => {
        if (status === 'offline') setHistory({ cpu: [], memory: [] });
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
        setHistory((current) => ({
            cpu: push(current.cpu, stats.cpu_absolute),
            memory: push(current.memory, stats.memory_bytes),
        }));
    });

    const offline = status === 'offline';
    const cpuPercent = percentOf(stats.cpu, limits.cpu);
    const memoryPercent = percentOf(stats.memory, mbToBytes(limits.memory));
    const diskPercent = percentOf(stats.disk, mbToBytes(limits.disk));

    return (
        <dl className={styles.side} aria-label={'Live usage'}>
            <Mini
                tone={'cpu'}
                icon={faMicrochip}
                title={'CPU load'}
                note={textLimits.cpu}
                value={offline ? 'Offline' : `${stats.cpu.toFixed(1)}%`}
                valueClassName={offline ? styles.mini_muted : bandClass(cpuPercent)}
            >
                <Spark values={history.cpu} label={'CPU load over the recent readings'} />
            </Mini>
            <Mini
                tone={'mem'}
                icon={faMemory}
                title={'Memory'}
                note={textLimits.memory}
                value={offline ? 'Offline' : bytesToString(stats.memory)}
                valueClassName={offline ? styles.mini_muted : bandClass(memoryPercent)}
            >
                <Spark values={history.memory} label={'Memory over the recent readings'} />
            </Mini>
            <Mini
                tone={'disk'}
                icon={faHdd}
                title={'Disk'}
                note={textLimits.disk}
                value={bytesToString(stats.disk)}
                valueClassName={bandClass(diskPercent)}
            >
                <span className={classNames('cs2-meter', usageBand(diskPercent))} aria-hidden={'true'}>
                    <span style={{ '--v': diskPercent / 100 } as React.CSSProperties} />
                </span>
            </Mini>
            <Mini tone={'net'} icon={faNetworkWired} title={'Network'} note={'since start'}>
                <div className={styles.pair}>
                    <span>
                        <span className={styles.swatch} aria-hidden={'true'} />
                        <small>In</small>
                        {offline ? '—' : bytesToString(stats.rx)}
                    </span>
                    <span>
                        <span className={classNames(styles.swatch, styles.swatch_out)} aria-hidden={'true'} />
                        <small>Out</small>
                        {offline ? '—' : bytesToString(stats.tx)}
                    </span>
                </div>
            </Mini>
            <Mini
                tone={(status && uptimeTones[status]) || 'off'}
                icon={faClock}
                title={'Uptime'}
                note={'since last start'}
                value={
                    status === null ? (
                        'Offline'
                    ) : stats.uptime > 0 && !offline ? (
                        <UptimeDuration uptime={stats.uptime / 1000} />
                    ) : (
                        capitalize(status)
                    )
                }
                valueClassName={offline || status === null ? styles.mini_muted : undefined}
            />
        </dl>
    );
};
