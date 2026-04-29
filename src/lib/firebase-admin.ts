import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'agilesuit',
  });
}

export const adminDb = admin.firestore();
