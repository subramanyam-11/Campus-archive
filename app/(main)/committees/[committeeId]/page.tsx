'use client';
import { CommitteeDetailView } from '@/src/views/CommitteeDetailView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function CommitteeDetailPage() {
  const { selectedCommittee, events, handleSelectEvent } = useAppContext();
  const router = useRouter();
  return (
    <CommitteeDetailView
      onNavigate={(path) => router.push(`/${path}`)} 
      committee={selectedCommittee} 
      events={events} 
      onSelectEvent={handleSelectEvent} 
    />
  );
}
