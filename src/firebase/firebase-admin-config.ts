
import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  const serviceAccountPath = process.cwd() + '/service-account.json';

  if (require('fs').existsSync(serviceAccountPath)) {
    // Local development with service account file
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: 'agilesuit',
    });
  } else {
    // Cloud environment (App Hosting) - uses implicit credentials
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'agilesuit',
    });
  }
} else {
  app = admin.app();
}

export const firebaseAdminApp = app;
export const db = admin.firestore();
export const auth = admin.auth();
