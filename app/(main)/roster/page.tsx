'use client';
import { RosterView } from '@/src/views/RosterView';
import { useRouter } from 'next/navigation';

export default function RosterPage() {
  const router = useRouter();
  return (
    <RosterView
      onNavigate={(path) => router.push(`/${path}`)} 
    />
  );
}
