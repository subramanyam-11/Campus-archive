'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import type { UserRole } from '@/src/types';

export default function SignInPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, switchDevRole } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName, selectedRole);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDevLogin = async (devRole: UserRole, defaultEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await loginWithEmail(defaultEmail, 'collegiate2024');
      } catch {
        // Create if does not exist in emulator
        await registerWithEmail(defaultEmail, 'collegiate2024', `${devRole.toUpperCase()} Officer`, devRole);
      }
      await switchDevRole(devRole);
      
      // Route based on role
      if (devRole === 'head') router.push('/head');
      else if (devRole === 'faculty') router.push('/faculty');
      else if (devRole === 'student') router.push('/student');
      else router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Dev login failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Institutional Single Sign-On
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            CampusArchive
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Centralized Committee &amp; Event Archival System (NAAC / NBA / IQAC)
          </p>
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-md disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">
            Or institutional email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="display-name">
                Full Name
              </label>
              <input
                id="display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dr. Jane Doe or Alex Smith"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="signin-email">
              Collegiate Email
            </label>
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@college.edu"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="signin-password">
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="initial-role">
                Assigned Role
              </label>
              <select
                id="initial-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Convener</option>
                <option value="head">Committee Head</option>
                <option value="iqac">IQAC Coordinator</option>
                <option value="principal">Principal</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-xs text-blue-400 hover:underline"
            >
              {authMode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Quick Dev/Demo Role Switching */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 text-center">
            Fast Role Login (Development Mode)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDevLogin('principal', 'principal@college.edu')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold">Principal</div>
              <div className="text-[10px] text-slate-400">Institutional Admin</div>
            </button>
            <button
              onClick={() => handleQuickDevLogin('iqac', 'iqac@college.edu')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold">IQAC Lead</div>
              <div className="text-[10px] text-slate-400">Compliance &amp; Reports</div>
            </button>
            <button
              onClick={() => handleQuickDevLogin('head', 'head@college.edu')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold">Committee Head</div>
              <div className="text-[10px] text-slate-400">Organise Events</div>
            </button>
            <button
              onClick={() => handleQuickDevLogin('faculty', 'faculty@college.edu')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold">Faculty Convener</div>
              <div className="text-[10px] text-slate-400">Event Approval</div>
            </button>
            <button
              onClick={() => handleQuickDevLogin('student', 'student@college.edu')}
              className="col-span-2 p-2 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 border border-blue-700/50 text-center transition-colors font-semibold"
            >
              Student Portal Access (Browse &amp; Enrol)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
