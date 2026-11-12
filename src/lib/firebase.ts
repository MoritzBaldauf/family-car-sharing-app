import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, collection, type Firestore } from 'firebase/firestore';

// Read config from Vite env vars if provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    try {
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
      });
    } catch {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization error, falling back to local mode:', error);
  }
}

/**
 * Deep cleans an object before sending to Firestore, removing any undefined
 * properties and ensuring safety for setDoc / updateDoc / writeBatch calls.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export { app, auth, db };

// Firestore collection & document helpers
export const getFamilyDocRef = (familyId: string) => {
  if (!db) return null;
  return doc(db, 'families', familyId);
};

export const getBookingsColRef = (familyId: string) => {
  if (!db) return null;
  return collection(db, 'families', familyId, 'bookings');
};

export const getWaitingListColRef = (familyId: string) => {
  if (!db) return null;
  return collection(db, 'families', familyId, 'waitingList');
};

export const getNotificationsColRef = (familyId: string) => {
  if (!db) return null;
  return collection(db, 'families', familyId, 'notifications');
};
