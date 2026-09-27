/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewType, UserPersona, Committee, EventItem } from './types';
import { USER_PERSONAS, INITIAL_COMMITTEES, INITIAL_EVENTS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { NewEventModal } from './components/NewEventModal';
import { RegisterCommitteeModal } from './components/RegisterCommitteeModal';

// Views
import { DashboardView } from './views/DashboardView';
import { CommitteesView } from './views/CommitteesView';
import { CommitteeDetailView } from './views/CommitteeDetailView';
import { EventsView } from './views/EventsView';
import { EventDetailView } from './views/EventDetailView';
import { ArchiveSearchView } from './views/ArchiveSearchView';
import { UploadDataView } from './views/UploadDataView';
import { RosterView } from './views/RosterView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<UserPersona>(USER_PERSONAS[0]);
  const [currentView, setCurrentView] = useState<ViewType>('upload-data');
  const [academicYear, setAcademicYear] = useState<string>('2024 – 2025');

  // Core Data State
  const [committees, setCommittees] = useState<Committee[]>(INITIAL_COMMITTEES);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee>(INITIAL_COMMITTEES[0]);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(INITIAL_EVENTS[0]);

  // Global search query
  const [searchQuery, setSearchQuery] = useState<string>('hackathon');

  // Modals & responsive state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [isRegisterCommitteeModalOpen, setIsRegisterCommitteeModalOpen] = useState<boolean>(false);

  // Handlers
  const handleSelectCommittee = (c: Committee) => {
    setSelectedCommittee(c);
  };

  const handleSelectEvent = (e: EventItem) => {
    setSelectedEvent(e);
  };

  const handleGlobalSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentView('archive-and-search');
  };

  const handleCreateEvent = (newEventData: Partial<EventItem>) => {
    const codeNumber = Math.floor(8900 + Math.random() * 90);
    const fullEvent: EventItem = {
      id: `evt-${Date.now()}`,
      code: `EV-${codeNumber}`,
      refNo: `CCEAS/ENGG/2024/${codeNumber}-R`,
      title: newEventData.title || 'New Collegiate Event',
      committee: newEventData.committee || 'ACM Student Chapter',
      committeeCode: newEventData.committeeCode || 'COM-CSE-09',
      department: newEventData.department || 'Department of Computer Science',
      convener: newEventData.convener || activePersona.name,
      category: newEventData.category || 'National Symposium',
      categoryType: (newEventData.categoryType as any) || 'symposium',
      dateStr: newEventData.dateStr || '20 Nov 2024',
      rawDate: newEventData.rawDate || '2024-11-20',
      venue: newEventData.venue || 'Auditorium A',
      budgetSanctioned: newEventData.budgetSanctioned || 85000,
      budgetUtilized: 0,
      utilizationNote: 'Under Finance Review',
      status: 'Pending',
      naacCategory: newEventData.naacCategory || 'NAAC Category 3.3.2',
      objective: newEventData.objective || 'Technical knowledge dissemination.',
      targetDelegates: newEventData.targetDelegates || '200 Delegates Cap',
      attendanceValidated: 0,
      attendanceTarget: newEventData.attendanceTarget || 200,
      attendanceTurnoutPercent: 0,
      surplusReturned: 0,
      timeline: [
        {
          step: '1. Proposal Submission',
          date: 'Today',
          actor: activePersona.name,
          remarks: 'Submitted for academic clearance.',
          cleared: true,
        },
      ],
      outcomesAtr: [],
      photos: [],
    };

    setEvents((prev) => [fullEvent, ...prev]);
    setSelectedEvent(fullEvent);
    setCurrentView('events');
  };

  const handleCreateCommittee = (newComm: Committee) => {
    setCommittees((prev) => [newComm, ...prev]);
    setSelectedCommittee(newComm);
    setCurrentView('committees');
  };

  const handleImportComplete = (itemsCount: number) => {
    // Refresh stats or switch to dashboard/events
    setTimeout(() => {
      setCurrentView('events');
    }, 1800);
  };

  // If user signs out, show Single Sign-On Portal
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(persona) => {
          setActivePersona(persona);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-body-md text-on-surface antialiased flex flex-col">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        academicYear={academicYear}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container offset by Sidebar width on Desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Fixed Top Administrative Header */}
        <Header
          currentView={currentView}
          selectedCommitteeName={selectedCommittee?.name}
          selectedEventTitle={selectedEvent?.title}
          activePersona={activePersona}
          onSelectPersona={setActivePersona}
          onNavigate={setCurrentView}
          onGlobalSearch={handleGlobalSearch}
          onLogout={() => setIsAuthenticated(false)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="relative pt-16 bg-surface min-h-[calc(100vh-4rem)] flex-1">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              activePersona={activePersona}
              events={events}
              onSelectEvent={handleSelectEvent}
              onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
            />
          )}

          {currentView === 'committees' && (
            <CommitteesView
              committees={committees}
              onSelectCommittee={handleSelectCommittee}
              onNavigate={setCurrentView}
              onOpenRegisterModal={() => setIsRegisterCommitteeModalOpen(true)}
            />
          )}

          {currentView === 'committee-detail' && (
            <CommitteeDetailView
              committee={selectedCommittee}
              onNavigate={setCurrentView}
              events={events}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              events={events}
              onSelectEvent={handleSelectEvent}
              onNavigate={setCurrentView}
              onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
            />
          )}

          {currentView === 'event-detail' && (
            <EventDetailView
              event={selectedEvent}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'archive-and-search' && (
            <ArchiveSearchView
              initialQuery={searchQuery}
              onNavigate={setCurrentView}
              onSelectEvent={handleSelectEvent}
              events={events}
            />
          )}

          {currentView === 'upload-data' && (
            <UploadDataView
              onNavigate={setCurrentView}
              onImportComplete={handleImportComplete}
            />
          )}

          {currentView === 'roster' && (
            <RosterView onNavigate={setCurrentView} />
          )}

          {currentView === 'reports' && (
            <ReportsView onNavigate={setCurrentView} />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onNavigate={setCurrentView}
              academicYear={academicYear}
              onUpdateAcademicYear={setAcademicYear}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
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
}
