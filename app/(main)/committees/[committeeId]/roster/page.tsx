'use client';

import { RosterView } from '@/src/views/RosterView';
import { useAppContext } from '@/src/components/AppContext';
import { useParams, notFound } from 'next/navigation';

export default function CommitteeRosterPage() {
  const { committees, handleNavigate } = useAppContext();
  const params = useParams();
  const committeeId = params?.committeeId as string;
  const committee = committees.find((c) => c.id === committeeId);

  if (!committee) {
    notFound();
  }

  return (
    <RosterView
      committee={committee}
      onNavigate={handleNavigate}
    />
  );
}
