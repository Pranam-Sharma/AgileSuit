import * as React from 'react';
import { createClient } from '@/auth/supabase/client';
import { RbacContext, RoleLevel } from '@/auth/rbac';

export function useRBAC() {
    const [rbacContext, setRbacContext] = React.useState<RbacContext | null>(null);
    const [isInitializing, setIsInitializing] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);
    const supabase = createClient();

    const fetchRbacContext = React.useCallback(async () => {
        setIsInitializing(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setRbacContext(null);
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('org_id, role_level, department_id, team_id')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("useRBAC: Failed to fetch profile", error);
                throw error;
            }

            if (profile) {
                setRbacContext({
                    userId: user.id,
                    orgId: profile.org_id,
                    roleLevel: profile.role_level as RoleLevel,
                    departmentId: profile.department_id,
                    teamId: profile.team_id
                });
            }
        } catch (err) {
            console.error("useRBAC initialization failed:", err);
            setError(err instanceof Error ? err : new Error('Unknown error in useRBAC'));
        } finally {
            setIsInitializing(false);
        }
    }, [supabase]);

    React.useEffect(() => {
        fetchRbacContext();
    }, [fetchRbacContext]);

    const forceRefresh = React.useCallback(() => {
        return fetchRbacContext();
    }, [fetchRbacContext]);

    return {
        rbacContext,
        isInitializing,
        error,
        forceRefresh
    };
}
