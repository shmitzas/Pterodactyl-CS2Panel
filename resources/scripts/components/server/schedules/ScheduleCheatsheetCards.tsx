import React from 'react';

const examples = [
    ['*/5 * * * *', 'every 5 minutes'],
    ['0 */1 * * *', 'every hour'],
    ['0 8-12 * * *', 'hour range'],
    ['0 0 * * *', 'once a day'],
    ['0 0 * * MON', 'every Monday'],
];

const characters = [
    ['*', 'any value'],
    [',', 'value list separator'],
    ['-', 'range values'],
    ['/', 'step values'],
];

const Card = ({ title, rows }: { title: string; rows: string[][] }) => (
    <div className={'h-full overflow-hidden rounded-xl border border-rule bg-paper-3 md:w-1/2'}>
        <h2 className={'px-6 py-4 font-bold text-ink'}>{title}</h2>
        {rows.map(([value, meaning]) => (
            <div key={value} className={'flex px-6 py-3 odd:bg-paper-2'}>
                <div className={'w-1/2 font-mono text-accent-text'}>{value}</div>
                <div className={'w-1/2 text-ink-2'}>{meaning}</div>
            </div>
        ))}
    </div>
);

export default () => (
    <>
        <Card title={'Examples'} rows={examples} />
        <Card title={'Special Characters'} rows={characters} />
    </>
);
