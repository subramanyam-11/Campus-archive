'use client';
import { EventDetailView } from '@/src/views/EventDetailView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function EventDetailPage() {
  const { selectedEvent } = useAppContext();
  const router = useRouter();
  return (
    <EventDetailView
      onNavigate={(path) => router.push(`/${path}`)} 
      event={selectedEvent} 
    />
  );
}
