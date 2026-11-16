import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import classNames from 'classnames';

interface Props {
    cron: Schedule['cron'];
    className?: string;
}

const Part = ({ value, label, first }: { value: string; label: string; first?: boolean }) => (
    <div className={classNames('w-1/5 sm:w-auto text-center', !first && 'ml-4')}>
        <p className={'font-mono font-medium text-ink'}>{value}</p>
        <p className={'text-2xs text-muted uppercase tracking-wider'}>{label}</p>
    </div>
);

const ScheduleCronRow = ({ cron, className }: Props) => (
    <div className={classNames('flex', className)}>
        <Part value={cron.minute} label={'Minute'} first />
        <Part value={cron.hour} label={'Hour'} />
        <Part value={cron.dayOfMonth} label={'Day (Month)'} />
        <Part value={cron.month} label={'Month'} />
        <Part value={cron.dayOfWeek} label={'Day (Week)'} />
    </div>
);

export default ScheduleCronRow;
