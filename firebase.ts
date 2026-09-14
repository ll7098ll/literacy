import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA5SZ-oRhae7Ovt_uT-aQe5WFAyxS7-KMM",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "literacy-lms.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "literacy-lms",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "literacy-lms.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "393362767880",
  appId: env.VITE_FIREBASE_APP_ID || "1:393362767880:web:16f286332286c3f3bb11bd",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const dbId = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
export const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
