import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// Firebase config (from your SDK snippet)
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

export function getFirebaseAuthErrorMessage(error: unknown) {
  const defaultMessage =
    'Authentication failed. Please check your connection and try again.';

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const code = typeof err.code === 'string' ? err.code : undefined;

    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Google sign-in request was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Please allow pop-ups to sign in with Google.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please check and try again.';
      case 'auth/missing-phone-number':
        return 'Please provide a phone number to receive the OTP.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later.';
      case 'auth/code-expired':
        return 'OTP expired. Please request a new code.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please check the code and try again.';
      case 'auth/session-expired':
        return 'Your verification session has expired. Please request a new OTP.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support if you need help.';
      case 'auth/user-not-found':
        return 'No user found with this account.';
      case 'auth/wrong-password':
        return 'Incorrect credentials. Please try again.';
      default:
        const msg = typeof err.message === 'string' ? err.message : undefined;
        return msg?.trim() ? msg : defaultMessage;
    }
  }

  return defaultMessage;
}

export { auth };
