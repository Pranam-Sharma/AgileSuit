'use server';

import { db } from '@/firebase/firebase-admin-config';

export async function syncUser(uid: string, email: string, displayName?: string | null) {
    if (!uid || !email) {
        throw new Error('Missing uid or email');
    }

    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.set({
            uid,
            email,
            displayName: displayName || null,
            updatedAt: new Date(),
        }, { merge: true });

        // Update createdAt only if it doesn't exist
        const docSnap = await userRef.get();
        if (!docSnap.exists || !docSnap.data()?.createdAt) {
            await userRef.set({ createdAt: new Date() }, { merge: true });
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error syncing user:', error);
        throw new Error(error.message || 'Failed to sync user');
    }
}
