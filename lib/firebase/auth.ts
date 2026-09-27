import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from './config';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  // Force account selection every time, useful if user has multiple accounts
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Domain restriction check
    const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_COLLEGE_EMAIL_DOMAIN || process.env.ALLOWED_COLLEGE_EMAIL_DOMAIN;
    
    if (allowedDomain && user.email) {
      const userDomain = user.email.split('@')[1];
      if (userDomain !== allowedDomain) {
        // If they use a non-college email, sign them out immediately
        await firebaseSignOut(auth);
        throw new Error(`Only ${allowedDomain} email addresses are allowed.`);
      }
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
