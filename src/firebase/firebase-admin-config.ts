
import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp({
    // For local development with service account file
    credential: admin.credential.cert(process.cwd() + '/service-account.json'),
    projectId: 'agilesuit',
  });
} else {
  app = admin.app();
}

export const firebaseAdminApp = app;
