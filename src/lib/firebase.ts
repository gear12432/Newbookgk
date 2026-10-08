import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth
} from 'firebase/auth';
import { 
  getDatabase, 
  Database
} from 'firebase/database';
import {
  getFirestore,
  Firestore
} from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// Get saved config from localStorage if user updated it in Settings, or env, or default
export function getStoredFirebaseConfig(): FirebaseConfigType {
  try {
    const saved = localStorage.getItem('my_wallet_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.apiKey !== 'AIzaSyYOUR_FIREBASE_API_KEY_HERE') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Firebase config:', e);
  }

  // Check env vars
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return defaultConfig as FirebaseConfigType;
}

export function isFirebaseConfigured(config: FirebaseConfigType): boolean {
  return Boolean(
    config &&
    config.apiKey &&
    config.apiKey !== 'AIzaSyYOUR_FIREBASE_API_KEY_HERE' &&
    config.apiKey.length > 10 &&
    (config.authDomain || config.projectId)
  );
}

let app: FirebaseApp;
let authInstance: Auth | null = null;
let dbInstance: Database | null = null;
let firestoreInstance: Firestore | null = null;

const activeConfig = getStoredFirebaseConfig();
export const isRealFirebaseActive = isFirebaseConfigured(activeConfig);

try {
  if (!getApps().length) {
    app = initializeApp(activeConfig);
  } else {
    app = getApp();
  }

  if (isRealFirebaseActive) {
    authInstance = getAuth(app);
    try {
      firestoreInstance = activeConfig.firestoreDatabaseId 
        ? getFirestore(app, activeConfig.firestoreDatabaseId)
        : getFirestore(app);
    } catch (e) {
      console.warn('Firestore notice:', e);
    }
    if (activeConfig.databaseURL) {
      try {
        dbInstance = getDatabase(app);
      } catch (e) {
        console.warn('RTDB notice:', e);
      }
    }
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export const appFirebase = app!;
export const auth = authInstance;
export const rtdb = dbInstance;
export const db = firestoreInstance;

/**
 * Save custom user Firebase config to localStorage and restart app
 */
export function saveFirebaseConfig(config: FirebaseConfigType): void {
  localStorage.setItem('my_wallet_firebase_config', JSON.stringify(config));
  window.location.reload();
}

/**
 * Reset Firebase config to defaults
 */
export function resetFirebaseConfig(): void {
  localStorage.removeItem('my_wallet_firebase_config');
  window.location.reload();
}
