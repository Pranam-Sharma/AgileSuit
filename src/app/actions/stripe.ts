'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(planId: string, userId: string) {
    if (!planId || !userId) {
        throw new Error('Missing planId or userId');
    }

    const supabase = await createClient();

    // Mock Session ID
    const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store pending subscription in Supabase
    const { error } = await supabase.from('pending_subscriptions').insert({
        session_id: mockSessionId,
        user_id: userId,
        plan_id: planId,
        status: 'pending',
    });

    if (error) {
        console.error('Error creating pending subscription:', error);
        throw new Error('Failed to create checkout session');
    }

    // Redirect directly to success page with mock session ID
    redirect(`/payment/success?session_id=${mockSessionId}`);
}

export async function finalizeSubscription(sessionId: string) {
    if (!sessionId) throw new Error('Missing sessionId');

    const supabase = await createClient();

    // 1. Get Pending Subscription
    const { data: pendingSub, error: fetchError } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (fetchError || !pendingSub) {
        console.warn("Session not found or already processed:", sessionId);
        return { success: false, error: 'Session not found' };
    }

    // 2. Create Active Subscription (Initially unlinked to an org, simply recorded)
    // NOTE: In our new schema, `subscriptions` is linked to `organizations`.
    // Since the user might not have an org yet, we might need to store this status 
    // on the USER profile or keep it in pending until they create an org.
    // 
    // STRATEGY: Update the pending_subscription status to 'paid'.
    // The `createOrganization` action will later look for this 'paid' pending subscription
    // and move it to the real `subscriptions` table linked to the org.

    // For now, we just mark it as 'paid' in the pending table to verify payment success.

    const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({ status: 'paid' })
        .eq('session_id', sessionId);

    if (updateError) {
        throw new Error("Failed to finalize subscription");
    }

    return { success: true, subscriptionId: sessionId };
}
