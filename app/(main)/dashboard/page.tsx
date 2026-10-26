'use client';
import { DashboardView } from '@/src/views/DashboardView';
import { useAppContext } from '@/src/components/AppContext';

export default function DashboardPage() {
  const { activePersona, events, handleSelectEvent, setIsNewEventModalOpen, handleNavigate } = useAppContext();
  return (
    <DashboardView
      onNavigate={handleNavigate} 
      activePersona={activePersona} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
      onOpenNewEventModal={() => setIsNewEventModalOpen(true)} 
    />
  );
}
