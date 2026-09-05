import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDDKHqZEi92dxcR9qd6XzWIWRx7trIrX0Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tni26038-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tni26038-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tni26038-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "478236920100",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:478236920100:web:7680802cbaaf00361d8bb1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J2SK5RKDP6"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
