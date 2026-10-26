'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/src/components/RoleGuard';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/student', label: 'Discover Events', icon: 'explore' },
    { href: '/student/my-events', label: 'My Enrolments & Passes', icon: 'confirmation_number' },
    { href: '/student/certificates', label: 'Verified Certificates', icon: 'workspace_premium' },
    { href: '/events', label: 'Public Campus Calendar', icon: 'event' },
    { href: '/dashboard', label: 'Administrative View', icon: 'dashboard' },
  ];

  return (
    <RoleGuard allowedRoles={['student', 'head', 'faculty', 'principal', 'iqac']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/student" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                SP
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">Student Portal</span>
                <span className="text-[11px] text-blue-400 font-medium">CampusArchive</span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Student Delegate
            </div>
            <div className="text-xs font-bold text-white truncate">
              {profile?.displayName || 'Aarav Sharma'}
            </div>
            <div className="text-[10px] font-mono text-blue-400 mt-0.5">
              PRN: {profile?.prn || '2024BCSE042'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Signout */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top Navbar */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">CCEAS Portal</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-blue-400 font-semibold">Student Delegate Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student/my-events"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                <span className="hidden sm:inline">My Passes</span>
              </Link>
            </div>
          </header>

          {/* View Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
