'use client';
import { ReportsView } from '@/src/views/ReportsView';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();
  return (
    <ReportsView
      onNavigate={(path) => router.push(`/${path}`)}
    />
  );
}
