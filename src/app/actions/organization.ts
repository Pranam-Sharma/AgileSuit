'use server';

import { db } from '@/firebase/firebase-admin-config';

export async function createOrganization(data: {
    userId: string;
    name: string;
    slug: string;
}) {
    const { userId, name, slug } = data;

    if (!userId || !name || !slug) {
        throw new Error('Missing required fields');
    }

    // Check if slug is taken (simple check)
    const snapshot = await db.collection('organizations').where('slug', '==', slug).get();
    if (!snapshot.empty) {
        throw new Error('This URL is already taken. Please choose another one.');
    }

    // Create Organization
    // User requested "OrganizationName -> subscription", implying readable IDs. 
    // We'll use the unique 'slug' as the Document ID.
    const orgRef = db.collection('organizations').doc(slug);
    const orgId = slug; // The ID is now the slug

    // Find active subscription for this user
    // Query specific user's subscriptions subcollection
    const subsSnapshot = await db.collection('users').doc(userId).collection('subscriptions')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

    let planId = 'free'; // Default or fallback
    if (!subsSnapshot.empty) {
        planId = subsSnapshot.docs[0].data().planId;
    }

    await orgRef.set({
        name,
        slug,
        ownerUserId: userId,
        planId,
        createdAt: new Date(),
    });

    // MOVE Subscription to Organization
    if (!subsSnapshot.empty) {
        const userSubDoc = subsSnapshot.docs[0];
        const subData = userSubDoc.data();

        // Create new sub in organizations/{slug}/subscriptions
        await orgRef.collection('subscriptions').doc(userSubDoc.id).set({
            ...subData,
            orgId: slug, // Update link
            updatedAt: new Date(),
        });

        // Delete from user (Move operation) to strictly follow the "Organization holds subscription" model
        await userSubDoc.ref.delete();
    }

    // Add Member to Organization Subcollection (users)
    await orgRef.collection('users').doc(userId).set({
        userId,
        role: 'owner',
        createdAt: new Date(),
    });

    // Update User Document with Org ID (Link user to org)
    await db.collection('users').doc(userId).set({
        orgId: slug,
        updatedAt: new Date()
    }, { merge: true });

    return { success: true, orgId };
}
