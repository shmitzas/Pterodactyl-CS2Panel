import http from '@/api/http';

export interface DashboardPreferences {
    order: string[];
    power: string[];
    prerelease: string[];
}

export const toDashboardPreferences = (raw?: Partial<DashboardPreferences> | null): DashboardPreferences => ({
    order: raw?.order || [],
    power: raw?.power || [],
    prerelease: raw?.prerelease || [],
});

export default (preferences: Partial<DashboardPreferences>): Promise<void> =>
    http.put('/api/client/account/dashboard', preferences).then(() => undefined);
