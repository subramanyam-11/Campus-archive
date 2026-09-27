'use client';
import { ArchiveSearchView } from '@/src/views/ArchiveSearchView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ArchivePage() {
  const { events, handleSelectEvent } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  return (
    <ArchiveSearchView
      onNavigate={(path) => router.push(`/${path}`)} 
      initialQuery={q}
      onSelectEvent={handleSelectEvent} 
      events={events} 
    />
  );
}
