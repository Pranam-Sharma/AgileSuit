
import 'server-only';
import * as admin from 'firebase-admin';

export function initializeServerApp() {
    if (admin.apps.length > 0) {
        return {
            firestore: admin.firestore(),
        }
    }

    try {
        // Initialize without explicit credentials.
        // The SDK will attempt to find credentials from the environment.
        admin.initializeApp();

         return {
            firestore: admin.firestore(),
        }

    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
        throw new Error('Failed to initialize server app');
    }
}
