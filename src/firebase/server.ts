
import 'server-only';
import * as admin from 'firebase-admin';

export function initializeServerApp() {
    if (admin.apps.length > 0) {
        return {
            firestore: admin.firestore(),
        }
    }

    try {
        const serviceAccount = {
            project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

         return {
            firestore: admin.firestore(),
        }

    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
        throw new Error('Failed to initialize server app');
    }
}
