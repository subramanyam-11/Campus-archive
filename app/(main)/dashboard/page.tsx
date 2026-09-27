'use client';
import { DashboardView } from '@/src/views/DashboardView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { activePersona, events, handleSelectEvent, setIsNewEventModalOpen } = useAppContext();
  const router = useRouter();
  return (
    <DashboardView
      onNavigate={(path) => router.push(`/${path}`)} 
      activePersona={activePersona} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
      onOpenNewEventModal={() => setIsNewEventModalOpen(true)} 
    />
  );
}
