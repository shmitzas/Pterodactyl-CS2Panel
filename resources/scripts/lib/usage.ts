export const percentOf = (value: number, limit: number) => (limit > 0 ? Math.min(100, (value / limit) * 100) : 0);

// Usage bands shared by every meter: amber from 75%, red from 90%.
export const usageBand = (percent: number) => (percent >= 90 ? 'is-high' : percent >= 75 ? 'is-warn' : undefined);
