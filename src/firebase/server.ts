
import 'server-only';
import * as admin from 'firebase-admin';

// Initialize the app if it's not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

export function initializeServerApp() {
    return {
        firestore: admin.firestore(),
    }
}
