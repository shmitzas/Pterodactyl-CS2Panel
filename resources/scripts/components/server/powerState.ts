import { ServerStatus } from '@/state/server';

export interface PowerPill {
    label: string;
    tone: string;
}

const pills: Record<NonNullable<ServerStatus>, PowerPill> = {
    running: { label: 'Running', tone: 'cs2-tone-ok' },
    starting: { label: 'Starting', tone: 'cs2-tone-warn' },
    stopping: { label: 'Stopping', tone: 'cs2-tone-warn' },
    offline: { label: 'Offline', tone: 'cs2-tone-bad' },
};

// The label and tone class for a server's power state; null is the moment before the socket reports one.
export const powerPill = (status: ServerStatus): PowerPill =>
    (status && pills[status]) || { label: 'Connecting…', tone: 'cs2-tone-off' };