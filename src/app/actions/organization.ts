'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createOrganization(data: {
    userId: string;
    name: string;
    slug: string;
}) {
    try {
        const { userId, name, slug } = data;

        if (!userId || !name || !slug) {
            return { error: 'Missing required fields' };
        }

        // 1. Verify Authentication & Identity
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        console.log("[createOrganization] Server User ID:", user?.id);
        console.log("[createOrganization] Client User ID:", userId);

        if (!user || user.id !== userId) {
            console.error("[createOrganization] Unauthorized: Mismatch or No Session");
            return { error: 'Unauthorized: Session mismatch or expired' };
        }

        // 2. Use Admin Client for Database Operations (Bypassing RLS)
        // This will throw if SUPABASE_SERVICE_ROLE_KEY is missing, caught by catch block below
        const adminSupabase = createAdminClient();

        // 3. Check if slug is taken
        const { data: existingOrg, error: fetchError } = await adminSupabase
            .from('organizations')
            .select('slug')
            .eq('slug', slug)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found", which is good
            console.error('[createOrganization] Slug check error:', fetchError);
            return { error: 'Database error checking URL availability' };
        }

        if (existingOrg) {
            return { error: 'This URL is already taken. Please choose another one.' };
        }

        // 4. Find any "paid" pending subscription for this user
        const { data: pendingSub } = await adminSupabase
            .from('pending_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'paid')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let planId = 'free';
        if (pendingSub) {
            planId = pendingSub.plan_id;
        }

        // 5. Create Organization
        const { error: orgError } = await adminSupabase.from('organizations').insert({
            slug,
            name,
            owner_id: userId,
            plan_id: planId,
        });

        if (orgError) {
            console.error('[createOrganization] Error creating org:', orgError);
            return { error: 'Failed to create organization. ' + orgError.message };
        }

        // 6. Create Organization Member (Owner)
        const { error: memberError } = await adminSupabase.from('organization_members').insert({
            org_slug: slug,
            user_id: userId,
            role: 'owner',
        });

        if (memberError) {
            console.error('[createOrganization] Error adding member:', memberError);
            // Non-fatal, but worth noting. Could revert org creation here if strict.
        }

        // 7. Move Pending Subscription to Actual Subscription (if exists)
        if (pendingSub) {
            const { error: subError } = await adminSupabase.from('subscriptions').insert({
                id: pendingSub.session_id,
                org_slug: slug,
                plan_id: planId,
                status: 'active',
                stripe_customer_id: 'mock_cus_' + Date.now(),
                stripe_subscription_id: 'mock_sub_' + Date.now(),
            });

            if (!subError) {
                await adminSupabase.from('pending_subscriptions').delete().eq('session_id', pendingSub.session_id);
            } else {
                console.error('[createOrganization] Subscription move error:', subError);
            }
        }

        // 8. Update User Profile with Org ID
        const { error: profileError } = await adminSupabase.from('profiles').update({ org_id: slug }).eq('id', userId);
        if (profileError) {
            console.error('[createOrganization] Profile update error:', profileError);
        }

        return { success: true, orgId: slug };

    } catch (error: any) {
        console.error('[createOrganization] FATAL ERROR:', error);
        // Return the actual error message so the user can see it (e.g. "SUPABASE_SERVICE_ROLE_KEY is not defined")
        return { error: error.message || 'An unexpected server error occurred' };
    }
}
