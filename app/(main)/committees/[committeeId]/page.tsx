'use client';

import { CommitteeDetailView } from '@/src/views/CommitteeDetailView';
import { useAppContext } from '@/src/components/AppContext';
import { useParams, notFound } from 'next/navigation';

export default function CommitteeDetailPage() {
  const { committees, events, handleSelectEvent, handleNavigate } = useAppContext();
  const params = useParams();
  const committeeId = params?.committeeId as string;
  const committee = committees.find((c) => c.id === committeeId);

  if (!committee) {
    notFound();
  }

  return (
    <CommitteeDetailView
      onNavigate={handleNavigate} 
      committee={committee} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
      initialTab="overview"
    />
  );
}
