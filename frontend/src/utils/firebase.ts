import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAd2D8GQ5ZAxOA_4NHaMkUrVeUIUa_WAKA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cineverse-4b6a5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cineverse-4b6a5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cineverse-4b6a5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "287666077599",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:287666077599:web:199502086a1e6111dc07aa",
};

// Safe Singleton Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters: force Google to show account picker popup on every click
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithGooglePopup = async (): Promise<{
  name: string;
  email: string;
  photoURL?: string;
}> => {
  const result: UserCredential = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user.email) {
    throw new Error("No email associated with this Google Account.");
  }

  return {
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    photoURL: user.photoURL || undefined,
  };
};
