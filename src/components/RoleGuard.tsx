'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import type { UserRole } from '@/src/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push('/sign-in');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const isAllowed = allowedRoles.includes(role);
      if (!isAllowed) {
        // Redirect unauthorized user to their respective home portal
        if (role === 'head') router.push('/head');
        else if (role === 'faculty') router.push('/faculty');
        else if (role === 'student') router.push('/student');
        else router.push('/dashboard');
      }
    }
  }, [user, role, loading, allowedRoles, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-3 p-6">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium animate-pulse">
          Verifying Institutional Clearance...
        </span>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
};
