'use server';

import { db } from '@/firebase/firebase-admin-config';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(planId: string, userId: string) {
    if (!planId || !userId) {
        throw new Error('Missing planId or userId');
    }

    // Mock Session ID
    const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store pending subscription in Firestore (Mocking Stripe's role)
    // We treat this as if Stripe initialized a session
    await db.collection('pendingSubscriptions').doc(mockSessionId).set({
        userId,
        planId,
        status: 'pending',
        createdAt: new Date(),
        sessionId: mockSessionId,
    });

    // Redirect directly to success page with mock session ID
    // Use relative path to ensure it works on any port (user is on 9002)
    redirect(`/payment/success?session_id=${mockSessionId}`);
}

export async function finalizeSubscription(sessionId: string) {
    if (!sessionId) throw new Error('Missing sessionId');

    // MOCK VERIFICATION
    // Here we just check if it exists in our pending collection

    // READING FIRST to get userId for the path
    const pendingRef = db.collection('pendingSubscriptions').doc(sessionId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
        // Already processed or invalid
        // Check if user already has it somehow? 
        // For now, simple error or success if idempotent.
        console.warn("Session not found or already processed:", sessionId);
        return { success: false, error: 'Session not found' };
    }

    const data = pendingSnap.data();
    if (!data) return { success: false, error: 'No data' };

    // New Path: users/{userId}/subscriptions/{autoId}
    const subscriptionRef = db.collection('users').doc(data.userId).collection('subscriptions').doc();

    await db.runTransaction(async (t) => {
        // Double check existence within transaction for safety
        const pDoc = await t.get(pendingRef);
        if (!pDoc.exists) {
            throw new Error("Session processed concurrently");
        }

        t.set(subscriptionRef, {
            userId: data.userId,
            planId: data.planId,
            stripeCustomerId: `mock_cus_${Date.now()}`,
            stripeSubscriptionId: `mock_sub_${Date.now()}`,
            status: 'active',
            createdAt: new Date(),
            orgId: null, // To be filled in company setup
        });

        t.delete(pendingRef);
    });

    return { success: true, subscriptionId: subscriptionRef.id };
}
