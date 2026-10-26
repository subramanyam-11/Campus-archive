'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
} from '@/lib/firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/src/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchDevRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to fetch or create user profile
  const syncUserProfile = async (firebaseUser: User, desiredRole?: UserRole): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        return data;
      }

      // Create new profile doc for first-time sign-in
      const defaultRole: UserRole = desiredRole || 'student';
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@college.edu`,
        displayName: firebaseUser.displayName || 'Academic User',
        role: defaultRole,
        department: 'Computer Engineering',
        prn: `2024BTECS${Math.floor(100 + Math.random() * 900)}`,
        badgeId: `USR-${firebaseUser.uid.substring(0, 6).toUpperCase()}`,
        avatarIcon: 'person',
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch {
      // Fallback local profile for offline/uninitialized state
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'user@college.edu',
        displayName: firebaseUser.displayName || 'Academic User',
        role: desiredRole || 'principal',
        department: 'Institutional Administration',
        prn: 'ADMIN-001',
        badgeId: 'EXE-PRIN-001',
        avatarIcon: 'shield_person',
        createdAt: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const u = await signInWithGoogle();
      await syncUserProfile(u);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await signInWithEmail(email, pass);
      await syncUserProfile(u);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role?: UserRole) => {
    setLoading(true);
    try {
      const u = await signUpWithEmail(email, pass, name);
      await syncUserProfile(u, role);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    setProfile(null);
  };

  const switchDevRole = async (newRole: UserRole) => {
    if (!profile) return;
    const updated = { ...profile, role: newRole };
    setProfile(updated);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Could not persist dev role switch to Firestore:', err);
      }
    }
  };

  const role: UserRole = profile?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
