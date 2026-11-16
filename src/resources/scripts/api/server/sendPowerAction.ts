import http from '@/api/http';
import type { PowerAction } from '@/components/server/console/ServerConsoleContainer';

export default (uuid: string, signal: PowerAction): Promise<void> =>
    http.post(`/api/client/servers/${uuid}/power`, { signal }).then(() => undefined);
