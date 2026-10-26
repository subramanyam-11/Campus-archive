'use client';
import { EventsView } from '@/src/views/EventsView';
import { useAppContext } from '@/src/components/AppContext';

export default function EventsPage() {
  const { events, handleSelectEvent, setIsNewEventModalOpen, handleNavigate } = useAppContext();
  return (
    <EventsView
      onNavigate={handleNavigate} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
      onOpenNewEventModal={() => setIsNewEventModalOpen(true)} 
    />
  );
}
