import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRbacContext } from '@/lib/rbac';
import { getDepartmentsAction, getTeamsAction, getOrganizationMembersAction } from '@/app/actions/teams';
import { TeamClient } from '@/components/team/team-client';

export default async function TeamPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    try {
        const rbacContext = await getRbacContext();

        // Client component now handles data fetching and RBAC init
        return (
            <main className="min-h-screen bg-slate-50/50">
                <TeamClient />
            </main>
        );

    } catch (e: any) {
        console.error("RBAC Initialization failed on team page:", e);
        // Fallback or handle unauthorized gracefully
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">You do not have access to this module.</h1>
                    <p className="text-slate-500 mt-2">Please contact your administrator if you believe this is an error.</p>
                </div>
            </div>
        );
    }
}
