'use client';
import { SettingsView } from '@/src/views/SettingsView';
import { useAppContext } from '@/src/components/AppContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { academicYear, setAcademicYear } = useAppContext();
  const router = useRouter();
  return (
    <SettingsView
      onNavigate={(path) => router.push(`/${path}`)} 
      academicYear={academicYear}
      onUpdateAcademicYear={setAcademicYear}
    />
  );
}
