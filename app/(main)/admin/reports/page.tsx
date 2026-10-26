'use client';
import { ReportsView } from '@/src/views/ReportsView';
import { useAppContext } from '@/src/components/AppContext';

export default function ReportsPage() {
  const { handleNavigate } = useAppContext();
  return (
    <ReportsView
      onNavigate={handleNavigate}
    />
  );
}
