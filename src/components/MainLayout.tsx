'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ViewType } from '../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NewEventModal } from './NewEventModal';
import { RegisterCommitteeModal } from './RegisterCommitteeModal';
import { useAppContext } from './AppContext';

const LayoutInner = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    activePersona, setActivePersona,
    academicYear,
    isNewEventModalOpen, setIsNewEventModalOpen,
    isRegisterCommitteeModalOpen, setIsRegisterCommitteeModalOpen,
    handleGlobalSearch, handleCreateEvent, handleCreateCommittee,
    committees, selectedCommittee, selectedEvent,
    handleNavigate
  } = useAppContext();

  // Map Next.js pathname accurately to ViewType
  const getActiveView = (path: string): ViewType => {
    if (path.startsWith('/admin/reports') || path === '/reports') return 'reports';
    if (path.startsWith('/archive')) return 'archive-and-search';
    if (path.startsWith('/upload')) return 'upload-data';
    if (path.startsWith('/committees/') && path !== '/committees') return 'committee-detail';
    if (path.startsWith('/events/') && path !== '/events') return 'event-detail';
    const firstSegment = path.split('/')[1];
    return (firstSegment || 'dashboard') as ViewType;
  };

  const currentView = getActiveView(pathname);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-surface font-sans text-body-md text-on-surface antialiased flex flex-col">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        academicYear={academicYear}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          currentView={currentView}
          selectedCommitteeName={selectedCommittee?.name}
          selectedEventTitle={selectedEvent?.title}
          activePersona={activePersona}
          onSelectPersona={setActivePersona}
          onNavigate={handleNavigate}
          onGlobalSearch={handleGlobalSearch}
          onLogout={() => router.push('/sign-in')}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="relative pt-16 bg-surface min-h-[calc(100vh-4rem)] flex-1">
          {children}
        </main>
      </div>

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        committees={committees}
        onSubmit={handleCreateEvent}
      />
      <RegisterCommitteeModal
        isOpen={isRegisterCommitteeModalOpen}
        onClose={() => setIsRegisterCommitteeModalOpen(false)}
        onSubmit={handleCreateCommittee}
      />
    </div>
  );
};

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <LayoutInner>{children}</LayoutInner>;
};

