import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { faMemory, faMicrochip, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { chartColors, useChart, useChartTickLabel } from '@/components/server/console/chart';
import { bytesToString } from '@/lib/formatters';
import { hexToRgba } from '@/lib/helpers';
import ChartBlock from '@/components/server/console/ChartBlock';
import styles from './style.module.css';

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2, chartColors.cpu);
    const memory = useChartTickLabel('Memory', limits.memory, 'MiB', undefined, chartColors.mem);
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            const color = !index ? chartColors.net : chartColors.netOut;

            return {
                ...opts,
                label: !index ? 'Network In' : 'Network Out',
                borderColor: color,
                backgroundColor: hexToRgba(color, !index ? 0.18 : 0.06),
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        network.push([
            previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx),
            previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx),
        ]);

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
            <ChartBlock title={'CPU load'} tone={'cpu'} icon={faMicrochip}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'} tone={'mem'} icon={faMemory}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Network'}
                tone={'net'}
                icon={faNetworkWired}
                legend={
                    <>
                        <span>
                            <span className={styles.swatch} aria-hidden={'true'} />
                            In
                        </span>
                        <span>
                            <span className={classNames(styles.swatch, styles.swatch_out)} aria-hidden={'true'} />
                            Out
                        </span>
                    </>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
