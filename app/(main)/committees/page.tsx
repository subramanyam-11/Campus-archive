'use client';
import { CommitteesView } from '@/src/views/CommitteesView';
import { useAppContext } from '@/src/components/AppContext';

export default function CommitteesPage() {
  const { committees, handleSelectCommittee, setIsRegisterCommitteeModalOpen, handleNavigate } = useAppContext();
  return (
    <CommitteesView
      onNavigate={handleNavigate} 
      committees={committees} 
      onSelectCommittee={handleSelectCommittee} 
      onOpenRegisterModal={() => setIsRegisterCommitteeModalOpen(true)} 
    />
  );
}
