import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import tw from 'twin.macro';
import classNames from 'classnames';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';

export default ({ schedule }: { schedule: Schedule }) => (
    <>
        <div css={tw`hidden md:block`}>
            <span className={'cs2-tile'}>
                <FontAwesomeIcon icon={faCalendarAlt} fixedWidth />
            </span>
        </div>
        <div css={tw`flex-1 md:ml-4`}>
            <p css={tw`font-semibold text-white`}>{schedule.name}</p>
            <p css={tw`text-xs text-white/50`}>
                Last run at: {schedule.lastRunAt ? format(schedule.lastRunAt, "MMM do 'at' h:mma") : 'never'}
            </p>
        </div>
        <div className={'sm:hidden'}>
            <p className={classNames('cs2-badge', schedule.isActive ? 'cs2-tone-success' : 'cs2-tone-muted')}>
                {schedule.isActive ? 'Active' : 'Inactive'}
            </p>
        </div>
        <ScheduleCronRow cron={schedule.cron} css={tw`mx-auto sm:mx-8 w-full sm:w-auto mt-4 sm:mt-0`} />
        <div className={'hidden sm:block'}>
            <p
                className={classNames(
                    'cs2-badge',
                    schedule.isActive && !schedule.isProcessing ? 'cs2-tone-success' : 'cs2-tone-muted'
                )}
            >
                {schedule.isProcessing ? 'Processing' : schedule.isActive ? 'Active' : 'Inactive'}
            </p>
        </div>
    </>
);
