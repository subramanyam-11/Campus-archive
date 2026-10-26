import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './config';
import { env } from '../env';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const allowedDomain = env.NEXT_PUBLIC_ALLOWED_COLLEGE_EMAIL_DOMAIN;
    
    // Domain restriction check if domain is specified and user email exists
    if (allowedDomain && user.email && !env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.startsWith('demo-')) {
      const userDomain = user.email.split('@')[1];
      if (userDomain !== allowedDomain) {
        await firebaseSignOut(auth);
        throw new Error(`Only authorized institutional ${allowedDomain} email addresses are permitted.`);
      }
    }
    
    return user;
  } catch (error) {
    const err = error as Error;
    console.error("Error signing in with Google:", err.message);
    throw err;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error) {
    const err = error as Error;
    console.error("Error signing in with Email/Password:", err.message);
    throw err;
  }
};

export const signUpWithEmail = async (email: string, pass: string, displayName: string): Promise<User> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  } catch (error) {
    const err = error as Error;
    console.error("Error signing up with Email/Password:", err.message);
    throw err;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const err = error as Error;
    console.error("Error signing out:", err.message);
    throw err;
  }
};
