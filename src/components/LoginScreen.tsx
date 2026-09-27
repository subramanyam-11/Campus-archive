import React, { useState } from 'react';
import { UserPersona } from '../types';
import { USER_PERSONAS } from '../data/mockData';

interface LoginScreenProps {
  onLoginSuccess: (persona: UserPersona) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('faculty@college.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // Find matching or default to admin
      const matched = USER_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
      onLoginSuccess(matched || USER_PERSONAS[0]);
      setIsSubmitting(false);
    }, 600);
  };

  const handleQuickLogin = (persona: UserPersona) => {
    setEmail(persona.email);
    setPassword('collegiate2024');
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(persona);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      <main className="w-full max-w-md mx-auto">
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-6 md:p-8 flex flex-col gap-6">
          {/* Institutional Crest / Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Secure Academic SSO
            </div>
            <h1 className="font-semibold text-headline-md text-on-surface">
              College Committee &amp; Event Archive System
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Institutional Single Sign-On &amp; Verification Portal
            </p>
          </div>

          {/* Sign In Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Collegiate Email Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-medium text-label-md text-on-surface" htmlFor="college-email">
                  Collegiate Email Address
                </label>
                <span className="text-[11px] text-on-surface-variant">SSO Required</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">
                  mail
                </span>
                <input
                  id="college-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@college.edu or student@college.edu"
                  className="w-full h-[38px] pl-9 pr-3 rounded-lg bg-surface border border-outline-variant/60 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-low focus:border-primary transition-colors outline-none"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                Requires authorized college domain (@college.edu)
              </p>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-medium text-label-md text-on-surface" htmlFor="password-input">
                  Institutional Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery notice sent to institutional registrar.'); }} className="text-label-sm text-primary hover:underline">
                  Forgot institutional password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">
                  lock
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-[38px] pl-9 pr-14 rounded-lg bg-surface border border-outline-variant/60 text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-low focus:border-primary transition-colors outline-none"
                />
                <button
                  type="button"
                  id="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface text-label-sm transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[40px] mt-1 bg-primary text-on-primary rounded-lg font-medium text-label-md hover:bg-primary-container active:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="border-t border-outline-variant/30 pt-3">
            <span className="text-[11px] uppercase tracking-wider text-outline font-semibold block mb-2 text-center">
              Instant Demo Access by Institutional Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              {USER_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p)}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left transition-colors flex flex-col"
                >
                  <span className="text-[12px] font-semibold text-on-surface truncate">{p.name}</span>
                  <span className="text-[10px] text-on-surface-variant truncate">{p.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Provisioning / IQAC Notice Block */}
          <div className="rounded-xl bg-surface-container-low p-4 flex gap-3 items-start border border-outline-variant/30">
            <div className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-sm">info</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-label-sm text-on-surface">First-time user or access pending?</span>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Accounts are provisioned via Dean/IQAC confirmation. Check your collegiate email for your activation token or contact{' '}
                <a className="text-primary hover:underline text-label-sm" href="mailto:sysadmin@college.edu">
                  sysadmin@college.edu
                </a>.
              </p>
            </div>
          </div>

          {/* Compliance Footnote */}
          <div className="pt-1 flex flex-col items-center justify-center text-center gap-1">
            <p className="text-[11px] text-on-surface-variant font-medium">Collegiate Governance &amp; Event Ledger • Academic Year 2024–25</p>
            <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                IQAC Standardized
              </span>
              <span>•</span>
              <span>Audit Trail V4.2</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
