'use client';

import { EventDetailView } from '@/src/views/EventDetailView';
import { useAppContext } from '@/src/components/AppContext';
import { useParams, notFound } from 'next/navigation';

export default function EventDetailPage() {
  const { events, handleNavigate } = useAppContext();
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailView
      onNavigate={handleNavigate} 
      event={event} 
    />
  );
}
