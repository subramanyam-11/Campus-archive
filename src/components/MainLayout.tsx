'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ViewType } from '../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NewEventModal } from './NewEventModal';
import { RegisterCommitteeModal } from './RegisterCommitteeModal';
import { AppProvider, useAppContext } from './AppContext';

const LayoutInner = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Map Next.js path to ViewType
  const currentView = (pathname.split('/')[1] || 'dashboard') as ViewType;
  
  const handleNavigate = (view: string) => {
    router.push(`/${view}`);
  };

  const {
    activePersona, setActivePersona,
    academicYear,
    isNewEventModalOpen, setIsNewEventModalOpen,
    isRegisterCommitteeModalOpen, setIsRegisterCommitteeModalOpen,
    handleGlobalSearch, handleCreateEvent, handleCreateCommittee,
    committees
  } = useAppContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-surface font-sans text-body-md text-on-surface antialiased flex flex-col">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate as any}
        academicYear={academicYear}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          currentView={currentView}
          selectedCommitteeName={undefined}
          selectedEventTitle={undefined}
          activePersona={activePersona}
          onSelectPersona={setActivePersona}
          onNavigate={handleNavigate as any}
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
  return (
    <AppProvider>
      <LayoutInner>{children}</LayoutInner>
    </AppProvider>
  );
};

