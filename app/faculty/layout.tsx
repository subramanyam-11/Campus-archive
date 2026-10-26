'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/src/components/RoleGuard';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/faculty', label: 'Approval Inbox', icon: 'inbox' },
    { href: '/faculty/calendar', label: 'Timeline & Calendar', icon: 'calendar_month' },
    { href: '/events', label: 'All Campus Events', icon: 'event' },
    { href: '/archive', label: 'Institutional Archive', icon: 'inventory_2' },
    { href: '/dashboard', label: 'Switch to Executive Admin', icon: 'admin_panel_settings' },
  ];

  return (
    <RoleGuard allowedRoles={['faculty', 'principal', 'iqac']}>
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
            <Link href="/faculty" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                FC
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">Faculty Convener</span>
                <span className="text-[11px] text-emerald-400 font-medium">CampusArchive</span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Convener Identity Badge */}
          <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Academic Review Desk
            </div>
            <div className="text-xs font-bold text-white truncate">
              {profile?.displayName || 'Dr. Rajesh Sundaram'}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              Role: Faculty Convener / Dean
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
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
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
                <span className="text-xs text-emerald-400 font-semibold">Faculty Approval Desk</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Reviewer: {user?.email || 'convener@campus.edu'}</span>
              </div>
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
