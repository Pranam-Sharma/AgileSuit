'use server';

import { db } from '@/firebase/firebase-admin-config';

export async function getUserRole(userId: string) {
    if (!userId) return null;

    try {
        // 1. Get User's Org ID
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;

        const orgId = userDoc.data()?.orgId;
        if (!orgId) return null;

        // 2. Get Role from Organization's Users Subcollection
        const memberDoc = await db.collection('organizations').doc(orgId).collection('users').doc(userId).get();

        if (!memberDoc.exists) return null;

        return memberDoc.data()?.role as string;
    } catch (error) {
        console.error('Error fetching role:', error);
        return null;
    }
}
