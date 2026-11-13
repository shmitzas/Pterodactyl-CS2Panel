import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import Checkbox from '@/components/elements/inputs/Checkbox';
import styles from './dashboard.module.css';

interface Props {
    open: boolean;
    title: string;
    servers: Server[];
    selected: string[];
    onClose: () => void;
    onSave: (uuids: string[]) => void;
    renderBadge?: (server: Server) => React.ReactNode;
}

export default ({ open, title, servers, selected, onClose, onSave, renderBadge }: Props) => {
    const [checked, setChecked] = useState(() => new Set(selected));

    useEffect(() => {
        if (open) setChecked(new Set(selected));
    }, [open]);

    const toggle = (uuid: string) =>
        setChecked((current) => {
            const next = new Set(current);
            if (!next.delete(uuid)) next.add(uuid);

            return next;
        });

    const count = servers.filter((s) => checked.has(s.uuid)).length;

    return (
        <Dialog open={open} onClose={onClose} title={title}>
            <div className={'mt-4 flex items-center justify-between gap-2'}>
                <p className={'text-sm text-muted'}>
                    {count} of {servers.length} selected
                </p>
                <div className={'flex gap-2'}>
                    <Button.Text
                        size={Button.Sizes.Small}
                        onClick={() => setChecked(new Set(servers.map((s) => s.uuid)))}
                    >
                        Select all
                    </Button.Text>
                    <Button.Text size={Button.Sizes.Small} onClick={() => setChecked(new Set())}>
                        Clear
                    </Button.Text>
                </div>
            </div>
            <div className={'mt-3 space-y-1.5'}>
                {servers.map((server) => (
                    <label
                        key={server.uuid}
                        className={classNames(styles.option, checked.has(server.uuid) && styles.selected)}
                    >
                        <Checkbox checked={checked.has(server.uuid)} onChange={() => toggle(server.uuid)} />
                        <span className={'min-w-0 flex-1 truncate text-ink'}>{server.name}</span>
                        {renderBadge?.(server)}
                    </label>
                ))}
            </div>
            <Dialog.Footer>
                <Button.Text onClick={onClose}>Cancel</Button.Text>
                <Button onClick={() => onSave(servers.map((s) => s.uuid).filter((uuid) => checked.has(uuid)))}>
                    <FontAwesomeIcon icon={faSave} />
                    Save
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};
