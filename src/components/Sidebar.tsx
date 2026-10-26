'use client';

import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  academicYear: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  academicYear,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { view: ViewType; label: string; icon: string; count?: number }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { view: 'committees', label: 'Committees', icon: 'groups' },
    { view: 'events', label: 'Events', icon: 'event' },
    { view: 'archive-and-search', label: 'Archive & Search', icon: 'folder_special' },
    { view: 'upload-data', label: 'Upload Data', icon: 'upload_file' },
    { view: 'roster', label: 'Roster', icon: 'badge' },
    { view: 'reports', label: 'Reports', icon: 'analytics' },
    { view: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Branding */}
        <div className="h-16 px-space-md border-b border-outline-variant/30 flex items-center justify-between">
          <button
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className="flex items-center gap-space-sm text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-headline-sm shadow-sm group-hover:bg-primary-container transition-colors">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-headline-sm text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                CCEAS Portal
              </span>
              <span className="text-[11px] text-on-surface-variant truncate font-medium">
                Institutional Archive
              </span>
            </div>
          </button>
          
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-space-sm py-space-md">
          <div className="px-space-sm pb-space-xs text-[11px] font-semibold text-outline uppercase tracking-wider">
            Institutional Repository
          </div>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                currentView === item.view ||
                (item.view === 'committees' && currentView === 'committee-detail') ||
                (item.view === 'events' && currentView === 'event-detail');

              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-space-sm px-space-sm py-space-sm rounded-lg transition-colors font-medium text-body-sm text-left w-full ${
                    isActive
                      ? 'bg-surface-container text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic Year Footer Badge */}
        <div className="p-space-sm border-t border-outline-variant/30">
          <div className="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-on-surface">Academic Year</span>
              <span className="text-[11px] text-on-surface-variant font-medium">{academicYear}</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
          </div>
        </div>
      </aside>
    </>
  );
};
