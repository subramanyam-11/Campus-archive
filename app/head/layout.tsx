'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/src/components/RoleGuard';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeadLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/head', label: 'My Committee Dashboard', icon: 'space_dashboard' },
    { href: '/head/events/create', label: 'Create Event Wizard', icon: 'add_circle' },
    { href: '/events', label: 'All Campus Events', icon: 'event' },
    { href: '/archive', label: 'Institutional Archive', icon: 'inventory_2' },
    { href: '/dashboard', label: 'Switch to Executive Admin', icon: 'admin_panel_settings' },
  ];

  return (
    <RoleGuard allowedRoles={['head', 'principal', 'iqac']}>
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
            <Link href="/head" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                CH
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">Head Portal</span>
                <span className="text-[11px] text-indigo-400 font-medium">CampusArchive</span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Committee Badge */}
          <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Active Committee
            </div>
            <div className="text-xs font-bold text-white truncate">
              {profile?.department || 'ACM Student Chapter'}
            </div>
            <div className="text-[10px] text-indigo-400 mt-0.5">
              Convener Role: {profile?.displayName || 'Committee Lead'}
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
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
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

        {/* Top Navbar */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Portals</span>
                <span className="text-slate-600">/</span>
                <span className="text-white font-medium">Committee Head Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{profile?.displayName || user?.email}</span>
                <span className="text-[10px] text-indigo-400 font-mono">{profile?.prn || 'HEAD-01'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/30">
                {profile?.displayName ? profile.displayName[0] : 'H'}
              </div>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
