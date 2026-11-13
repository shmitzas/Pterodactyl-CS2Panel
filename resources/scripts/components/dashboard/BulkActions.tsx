import React, { useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
    faBan,
    faFlask,
    faPen,
    faPlay,
    faPowerOff,
    faRedoAlt,
    faSkull,
    faStop,
} from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import { httpErrorToHuman } from '@/api/http';
import sendPowerAction from '@/api/server/sendPowerAction';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import type { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import ServerSelectDialog from '@/components/dashboard/ServerSelectDialog';
import useDashboardPreferences from '@/plugins/useDashboardPreferences';
import useFlash from '@/plugins/useFlash';
import styles from './dashboard.module.css';

const FLASH_KEY = 'dashboard:bulk';

// Defined by the CS2 egg ("Allow Prerelease Updates", 0/1); read by its updaters on server start.
const PRERELEASE_VARIABLE = 'PRERELEASE';

const prereleaseVariable = (server: Server) => server.variables.find((v) => v.envVariable === PRERELEASE_VARIABLE);

export const isPrereleaseOn = (server: Server) => {
    const variable = prereleaseVariable(server);
    const value = (variable?.serverValue ?? variable?.defaultValue ?? '').toLowerCase();

    return value === '1' || value === 'true';
};

const countServers = (count: number) => `${count} ${count === 1 ? 'server' : 'servers'}`;

interface Failure {
    name: string;
    reason: string;
}

/**
 * Runs the task on every server in parallel and resolves with the ones that failed.
 */
const runOnServers = (targets: Server[], task: (server: Server) => Promise<unknown>): Promise<Failure[]> =>
    Promise.all(
        targets.map((server) =>
            task(server).then(
                () => null,
                (error) => ({ name: server.name, reason: httpErrorToHuman(error) })
            )
        )
    ).then((results) => results.filter((result): result is Failure => result !== null));

// "A, B: reason; C: other reason", so an offline node doesn't repeat the same error per server.
const describeFailures = (failures: Failure[]) => {
    const byReason = new Map<string, string[]>();
    failures.forEach(({ name, reason }) => byReason.set(reason, [...(byReason.get(reason) || []), name]));

    return Array.from(byReason, ([reason, names]) => `${names.join(', ')}: ${reason}`).join('; ');
};

const useReport = () => {
    const { addFlash, clearFlashes } = useFlash();

    return {
        clear: () => clearFlashes(FLASH_KEY),
        report: (failures: Failure[], total: number, success: string) => {
            if (!failures.length) {
                addFlash({ key: FLASH_KEY, type: 'success', title: 'Success', message: success });
                return;
            }

            const message = `Failed on ${failures.length} of ${countServers(total)}: ${describeFailures(failures)}`;
            addFlash({ key: FLASH_KEY, type: 'error', title: 'Error', message });
        },
    };
};

interface PanelProps {
    icon: IconProp;
    title: string;
    summary: string;
    busy: boolean;
    selected: Server[];
    onEdit: () => void;
    renderTag?: (server: Server) => React.ReactNode;
    children: React.ReactNode;
}

const Panel = ({ icon, title, summary, busy, selected, onEdit, renderTag, children }: PanelProps) => (
    <article className={classNames('cs2-card cs2-tone-accent', styles.group)}>
        <div className={'cs2-card-head'}>
            <span className={'cs2-tile'} aria-hidden={'true'}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <div className={'cs2-card-titles'}>
                <h2 className={'cs2-card-title'}>{title}</h2>
                <p className={'cs2-card-sub'}>{summary}</p>
            </div>
            {busy && <Spinner size={'small'} />}
            <Button.Text size={Button.Sizes.Small} variant={Button.Variants.Secondary} onClick={onEdit}>
                <FontAwesomeIcon icon={faPen} />
                Edit
            </Button.Text>
        </div>
        <div className={classNames('cs2-card-body', styles.group_body)}>
            {selected.length ? (
                <ul className={styles.members}>
                    {selected.map((server) => {
                        const tag = renderTag?.(server);

                        return (
                            <li key={server.uuid} className={classNames(styles.member, tag && styles.member_tagged)}>
                                {server.name}
                                {tag}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className={styles.empty_members}>No servers selected yet. Use Edit to pick some.</p>
            )}
            <div className={styles.actions}>{children}</div>
        </div>
    </article>
);

const confirmations: Record<Exclude<PowerAction, 'start'>, string> = {
    restart: 'Players on these servers will be disconnected while they restart.',
    stop: 'Players on these servers will be disconnected.',
    kill: 'Forcibly stopping a server can lead to data corruption.',
};

const label = (action: PowerAction) => action.charAt(0).toUpperCase() + action.slice(1);

const PowerPanel = ({ pool }: { pool: Server[] }) => {
    const { preferences, save } = useDashboardPreferences();
    const { clear, report } = useReport();
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    // Kept after closing so the dialog text doesn't change during its exit animation.
    const [pending, setPending] = useState<{ open: boolean; action: Exclude<PowerAction, 'start'> }>({
        open: false,
        action: 'restart',
    });

    const chosen = new Set(preferences.power);
    const selected = pool.filter((server) => chosen.has(server.uuid));

    const run = async (action: PowerAction) => {
        setPending((current) => ({ ...current, open: false }));
        setBusy(true);
        clear();

        const failures = await runOnServers(selected, (server) => sendPowerAction(server.uuid, action));
        report(failures, selected.length, `Sent ${action} to ${countServers(selected.length)}.`);
        setBusy(false);
    };

    const disabled = busy || !selected.length;

    return (
        <>
            <Panel
                icon={faPowerOff}
                title={'Power Actions'}
                summary={countServers(selected.length)}
                busy={busy}
                selected={selected}
                onEdit={() => setEditing(true)}
            >
                <Button.Success size={Button.Sizes.Small} disabled={disabled} onClick={() => run('start')}>
                    <FontAwesomeIcon icon={faPlay} />
                    Start
                </Button.Success>
                <Button.Accent
                    size={Button.Sizes.Small}
                    disabled={disabled}
                    onClick={() => setPending({ open: true, action: 'restart' })}
                >
                    <FontAwesomeIcon icon={faRedoAlt} />
                    Restart
                </Button.Accent>
                <Button.Text
                    size={Button.Sizes.Small}
                    disabled={disabled}
                    onClick={() => setPending({ open: true, action: 'stop' })}
                >
                    <FontAwesomeIcon icon={faStop} />
                    Stop
                </Button.Text>
                <Button.Danger
                    size={Button.Sizes.Small}
                    disabled={disabled}
                    onClick={() => setPending({ open: true, action: 'kill' })}
                >
                    <FontAwesomeIcon icon={faSkull} />
                    Kill
                </Button.Danger>
            </Panel>
            <Dialog.Confirm
                open={pending.open}
                onClose={() => setPending((current) => ({ ...current, open: false }))}
                title={`${label(pending.action)} ${countServers(selected.length)}?`}
                confirm={label(pending.action)}
                onConfirmed={() => run(pending.action)}
            >
                {confirmations[pending.action]}
            </Dialog.Confirm>
            <ServerSelectDialog
                open={editing}
                title={'Power Actions'}
                servers={pool}
                selected={preferences.power}
                onClose={() => setEditing(false)}
                onSave={(uuids) => {
                    save({ power: uuids });
                    setEditing(false);
                }}
            />
        </>
    );
};

const PrereleasePanel = ({ cs2, onChange }: { cs2: Server[]; onChange: () => Promise<unknown> }) => {
    const { preferences, save } = useDashboardPreferences();
    const { clear, report } = useReport();
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);

    const chosen = new Set(preferences.prerelease);
    const selected = cs2.filter((server) => chosen.has(server.uuid));
    const enabledCount = selected.filter(isPrereleaseOn).length;

    const apply = async (enabled: boolean) => {
        setBusy(true);
        clear();

        const failures = await runOnServers(selected, (server) =>
            updateStartupVariable(server.uuid, PRERELEASE_VARIABLE, enabled ? '1' : '0')
        );
        await onChange();
        report(
            failures,
            selected.length,
            `Pre-release ${enabled ? 'enabled' : 'disabled'} on ${countServers(selected.length)}; ` +
                'it applies on their next restart.'
        );
        setBusy(false);
    };

    const tag = (server: Server) => (
        <span className={classNames('cs2-tag', isPrereleaseOn(server) ? 'cs2-tone-accent' : 'cs2-tone-off')}>
            {isPrereleaseOn(server) ? 'On' : 'Off'}
        </span>
    );

    return (
        <>
            <Panel
                icon={faFlask}
                title={'SwiftlyS2 Pre-release'}
                summary={`${countServers(selected.length)}, ${enabledCount} enabled`}
                busy={busy}
                selected={selected}
                onEdit={() => setEditing(true)}
                renderTag={tag}
            >
                <Button.Accent
                    size={Button.Sizes.Small}
                    disabled={busy || !selected.length}
                    onClick={() => apply(true)}
                >
                    <FontAwesomeIcon icon={faFlask} />
                    Enable pre-release
                </Button.Accent>
                <Button.Text
                    size={Button.Sizes.Small}
                    variant={Button.Variants.Secondary}
                    disabled={busy || !selected.length}
                    onClick={() => apply(false)}
                >
                    <FontAwesomeIcon icon={faBan} />
                    Disable pre-release
                </Button.Text>
            </Panel>
            <ServerSelectDialog
                open={editing}
                title={'SwiftlyS2 Pre-release'}
                servers={cs2}
                selected={preferences.prerelease}
                onClose={() => setEditing(false)}
                onSave={(uuids) => {
                    save({ prerelease: uuids });
                    setEditing(false);
                }}
                renderBadge={tag}
            />
        </>
    );
};

/**
 * Saved server groups for bulk power actions and for toggling CS2 prerelease updates.
 */
export default ({ pool, onChange }: { pool: Server[]; onChange: () => Promise<unknown> }) => {
    const cs2 = pool.filter((server) => prereleaseVariable(server)?.isEditable);

    if (pool.length < 2 && !cs2.length) return null;

    return (
        <>
            <FlashMessageRender byKey={FLASH_KEY} className={'mb-4'} />
            <section className={styles.groups} aria-label={'Saved groups'}>
                {pool.length > 1 && <PowerPanel pool={pool} />}
                {cs2.length > 0 && <PrereleasePanel cs2={cs2} onChange={onChange} />}
            </section>
        </>
    );
};
