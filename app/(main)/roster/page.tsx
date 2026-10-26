'use client';
import { RosterView } from '@/src/views/RosterView';
import { useAppContext } from '@/src/components/AppContext';

export default function RosterPage() {
  const { handleNavigate } = useAppContext();
  return (
    <RosterView
      onNavigate={handleNavigate} 
    />
  );
}
