'use client';

import React, { createContext, useContext, useState } from 'react';
import { ViewType, UserPersona, Committee, EventItem } from '../types';
import { USER_PERSONAS, INITIAL_COMMITTEES, INITIAL_EVENTS } from '../data/mockData';
import { useRouter } from 'next/navigation';

interface AppContextType {
  activePersona: UserPersona;
  setActivePersona: (persona: UserPersona) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  committees: Committee[];
  setCommittees: (committees: Committee[]) => void;
  selectedCommittee: Committee;
  setSelectedCommittee: (committee: Committee) => void;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  selectedEvent: EventItem;
  setSelectedEvent: (event: EventItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNewEventModalOpen: boolean;
  setIsNewEventModalOpen: (open: boolean) => void;
  isRegisterCommitteeModalOpen: boolean;
  setIsRegisterCommitteeModalOpen: (open: boolean) => void;
  handleSelectCommittee: (c: Committee) => void;
  handleSelectEvent: (e: EventItem) => void;
  handleGlobalSearch: (q: string) => void;
  handleCreateEvent: (newEventData: Partial<EventItem>) => void;
  handleCreateCommittee: (newComm: Committee) => void;
  handleNavigate: (view: ViewType | string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  const [activePersona, setActivePersona] = useState<UserPersona>(USER_PERSONAS[0]);
  const [academicYear, setAcademicYear] = useState<string>('2024 – 2025');

  const [committees, setCommittees] = useState<Committee[]>(INITIAL_COMMITTEES);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee>(INITIAL_COMMITTEES[0]);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(INITIAL_EVENTS[0]);

  const [searchQuery, setSearchQuery] = useState<string>('hackathon');

  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [isRegisterCommitteeModalOpen, setIsRegisterCommitteeModalOpen] = useState<boolean>(false);

  const handleNavigate = (view: ViewType | string) => {
    switch (view) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'committees':
        router.push('/committees');
        break;
      case 'committee-detail':
        router.push(selectedCommittee?.id ? `/committees/${selectedCommittee.id}` : '/committees');
        break;
      case 'events':
        router.push('/events');
        break;
      case 'event-detail':
        router.push(selectedEvent?.id ? `/events/${selectedEvent.id}` : '/events');
        break;
      case 'archive-and-search':
      case 'archive':
        router.push('/archive');
        break;
      case 'upload-data':
      case 'upload':
        router.push('/upload');
        break;
      case 'roster':
        router.push('/roster');
        break;
      case 'reports':
        router.push('/admin/reports');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        router.push(`/${view}`);
    }
  };

  const handleSelectCommittee = (c: Committee) => {
    setSelectedCommittee(c);
    router.push(`/committees/${c.id}`);
  };

  const handleSelectEvent = (e: EventItem) => {
    setSelectedEvent(e);
    router.push(`/events/${e.id}`);
  };

  const handleGlobalSearch = (q: string) => {
    setSearchQuery(q);
    router.push('/archive');
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
      categoryType: newEventData.categoryType || 'symposium',
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
    setIsNewEventModalOpen(false);
    router.push('/events');
  };

  const handleCreateCommittee = (newComm: Committee) => {
    setCommittees((prev) => [newComm, ...prev]);
    setSelectedCommittee(newComm);
    setIsRegisterCommitteeModalOpen(false);
    router.push('/committees');
  };

  return (
    <AppContext.Provider value={{
      activePersona, setActivePersona,
      academicYear, setAcademicYear,
      committees, setCommittees,
      selectedCommittee, setSelectedCommittee,
      events, setEvents,
      selectedEvent, setSelectedEvent,
      searchQuery, setSearchQuery,
      isNewEventModalOpen, setIsNewEventModalOpen,
      isRegisterCommitteeModalOpen, setIsRegisterCommitteeModalOpen,
      handleSelectCommittee, handleSelectEvent,
      handleGlobalSearch, handleCreateEvent, handleCreateCommittee,
      handleNavigate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
