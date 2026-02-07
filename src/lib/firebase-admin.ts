import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  // Vercel: use FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)
  // Local: falls back to GOOGLE_APPLICATION_CREDENTIALS file path
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const parsed = JSON.parse(serviceAccountKey);
    initializeApp({ credential: cert(parsed) });
  } else {
    // Local dev: uses GOOGLE_APPLICATION_CREDENTIALS file path
    initializeApp();
  }
}

export const db = getFirestore();
