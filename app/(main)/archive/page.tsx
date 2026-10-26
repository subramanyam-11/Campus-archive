'use client';
import { Suspense } from 'react';
import { ArchiveSearchView } from '@/src/views/ArchiveSearchView';
import { useAppContext } from '@/src/components/AppContext';
import { useSearchParams } from 'next/navigation';

function ArchiveContent() {
  const { events, handleSelectEvent, handleNavigate } = useAppContext();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  return (
    <ArchiveSearchView
      onNavigate={handleNavigate} 
      initialQuery={q}
      onSelectEvent={handleSelectEvent} 
      events={events} 
    />
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant">Loading archive...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
