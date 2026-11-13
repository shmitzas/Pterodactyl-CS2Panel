import { useStoreActions, useStoreState } from 'easy-peasy';
import updateDashboardPreferences, { DashboardPreferences } from '@/api/account/updateDashboardPreferences';
import { useFlashKey } from '@/plugins/useFlash';

/**
 * Reads the account's dashboard order/selections and saves changes optimistically.
 */
export default () => {
    const preferences = useStoreState((state) => state.user.data!.dashboardPreferences);
    const update = useStoreActions((actions) => actions.user.updateDashboardPreferences);
    const { clearAndAddHttpError } = useFlashKey('dashboard');

    const save = (patch: Partial<DashboardPreferences>) => {
        update(patch);
        updateDashboardPreferences(patch).catch(clearAndAddHttpError);
    };

    return { preferences, save };
};
