'use client';
import { EventsView } from '@/src/views/EventsView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const { events, handleSelectEvent, setIsNewEventModalOpen } = useAppContext();
  const router = useRouter();
  return (
    <EventsView
      onNavigate={(path) => router.push(`/${path}`)} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
      onOpenNewEventModal={() => setIsNewEventModalOpen(true)} 
    />
  );
}
