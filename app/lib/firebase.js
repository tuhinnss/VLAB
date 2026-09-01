import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && value !== ""
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

googleProvider?.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error(
      "Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* values to .env.local."
    );
  }

  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail({ email, password }) {
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* values to .env.local."
    );
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail({ email, password }) {
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* values to .env.local."
    );
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  if (!auth) {
    return;
  }

  return signOut(auth);
}

export function listenToAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}
