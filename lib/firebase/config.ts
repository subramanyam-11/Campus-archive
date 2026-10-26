import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { env } from "../env";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development or when explicitly enabled
if (typeof window !== "undefined") {
  const isEmulator =
    env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ||
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.startsWith("demo-");

  const globalWithEmulators = window as typeof window & { _emulatorsConnected?: boolean };

  if (isEmulator && !globalWithEmulators._emulatorsConnected) {
    try {
      connectAuthEmulator(auth, env.NEXT_PUBLIC_EMULATOR_AUTH_URL, { disableWarnings: true });
      connectFirestoreEmulator(db, "localhost", parseInt(env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PORT, 10));
      connectStorageEmulator(storage, "localhost", parseInt(env.NEXT_PUBLIC_EMULATOR_STORAGE_PORT, 10));
      globalWithEmulators._emulatorsConnected = true;
    } catch {
      // Emulator connection already established
    }
  }
}

export default app;
