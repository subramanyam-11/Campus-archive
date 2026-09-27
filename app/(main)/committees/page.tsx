'use client';
import { CommitteesView } from '@/src/views/CommitteesView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function CommitteesPage() {
  const { committees, handleSelectCommittee, setIsRegisterCommitteeModalOpen } = useAppContext();
  const router = useRouter();
  return (
    <CommitteesView
      onNavigate={(path) => router.push(`/${path}`)} 
      committees={committees} 
      onSelectCommittee={handleSelectCommittee} 
      onOpenRegisterModal={() => setIsRegisterCommitteeModalOpen(true)} 
    />
  );
}
