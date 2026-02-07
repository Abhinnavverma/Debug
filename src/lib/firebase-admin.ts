import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  // On Firebase App Hosting, Application Default Credentials are automatically available.
  // For local development, run: gcloud auth application-default login
  // Or set GOOGLE_APPLICATION_CREDENTIALS to a service account key file path.
  initializeApp();
}

export const db = getFirestore();
