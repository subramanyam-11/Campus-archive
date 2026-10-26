'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ViewType, UserPersona } from '../types';
import { USER_PERSONAS } from '../data/mockData';

interface HeaderProps {
  currentView: ViewType;
  selectedCommitteeName?: string;
  selectedEventTitle?: string;
  activePersona: UserPersona;
  onSelectPersona: (p: UserPersona) => void;
  onNavigate: (view: ViewType) => void;
  onGlobalSearch: (query: string) => void;
  onLogout: () => void;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  selectedCommitteeName,
  selectedEventTitle,
  activePersona,
  onSelectPersona,
  onNavigate,
  onGlobalSearch,
  onLogout,
  onOpenMobileSidebar,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      onGlobalSearch(searchInput.trim());
      onNavigate('archive-and-search');
    }
  };

  const renderBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">account_balance</span>
            <span>Institutional Repository</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Record Index</span>
          </>
        );
      case 'committees':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">groups</span>
            <span>Institutional Repository</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Committees Directory</span>
          </>
        );
      case 'committee-detail':
        return (
          <>
            <button onClick={() => onNavigate('committees')} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-outline">groups</span>
              <span>Committees</span>
            </button>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium truncate max-w-[200px] md:max-w-md">
              {selectedCommitteeName || 'ACM Student Chapter & Coding Club'}
            </span>
          </>
        );
      case 'events':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">event</span>
            <span>Institutional Repository</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Events Registry</span>
          </>
        );
      case 'event-detail':
        return (
          <>
            <button onClick={() => onNavigate('events')} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">event</span>
              <span>Events</span>
            </button>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium text-[11px]">EVT-2024-089</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-[160px] md:max-w-md">
              {selectedEventTitle || 'National Symposium on Renewable Energy'}
            </span>
          </>
        );
      case 'archive-and-search':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">folder_special</span>
            <span>System</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Archive & Search Repository</span>
          </>
        );
      case 'upload-data':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">data_object</span>
            <span>Data Ingestion</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Bulk Upload & Migration</span>
          </>
        );
      case 'roster':
        return (
          <>
            <button onClick={() => onNavigate('committees')} className="hover:text-primary transition-colors">Committees</button>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('committee-detail')}>ACM Student Chapter</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Roster Management</span>
          </>
        );
      case 'reports':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">analytics</span>
            <span>Administrative Console</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">Compliance & Reports</span>
          </>
        );
      case 'settings':
        return (
          <>
            <span className="material-symbols-outlined text-[18px] text-outline">settings</span>
            <span>Administrative Console</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-medium">System Configuration</span>
          </>
        );
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 flex items-center justify-between px-4 lg:px-gutter-desktop shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-space-sm min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex items-center gap-space-xs text-on-surface-variant text-[13px] font-medium truncate">
          {renderBreadcrumb()}
        </div>
      </div>

      {/* Right side: Global Search + User Profile Menu */}
      <div className="flex items-center gap-space-md shrink-0">
        {/* Global Search */}
        <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search archives, records, minutes, orders..."
            className="w-full h-9 pl-9 pr-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/50 placeholder:text-outline text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
          />
        </div>

        <div className="h-6 w-px bg-outline-variant/40 hidden sm:block"></div>

        {/* User Identity Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container transition-colors text-left"
          >
            <div className="flex flex-col text-right hidden md:flex">
              <span className="font-semibold text-label-md text-on-surface leading-tight">
                {activePersona.name}
              </span>
              <span className="text-[11px] text-on-surface-variant leading-tight">
                {activePersona.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary">
              <span className="material-symbols-outlined text-[18px]">
                {activePersona.avatarIcon}
              </span>
            </div>
          </button>

          {/* Profile Dropdown & Persona Switcher */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-outline-variant/30">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                  Authenticated Collegiate Session
                </div>
                <div className="font-semibold text-on-surface text-[14px] mt-0.5">
                  {activePersona.name}
                </div>
                <div className="text-[12px] text-on-surface-variant font-mono">
                  {activePersona.badgeId} • {activePersona.email}
                </div>
                <div className="text-[11px] text-primary font-medium mt-1">
                  {activePersona.department}
                </div>
              </div>

              {/* Persona Switcher (Inspired by SecureDocs persona panel) */}
              <div className="px-3 py-2 border-b border-outline-variant/30">
                <div className="px-1 pb-1.5 text-[11px] uppercase tracking-wider font-semibold text-outline flex items-center justify-between">
                  <span>Switch Role / Authority</span>
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                </div>
                <div className="flex flex-col gap-1">
                  {USER_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        setShowProfileMenu(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-body-sm transition-colors flex items-center justify-between ${
                        activePersona.id === persona.id
                          ? 'bg-surface-container text-primary font-semibold'
                          : 'hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] truncate">{persona.name}</span>
                        <span className="text-[11px] text-on-surface-variant truncate">
                          {persona.role}
                        </span>
                      </div>
                      {activePersona.id === persona.id && (
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 px-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] font-medium text-error hover:bg-error-container/20 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Exit Session & Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
