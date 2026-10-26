'use client';
import { SettingsView } from '@/src/views/SettingsView';
import { useAppContext } from '@/src/components/AppContext';

export default function SettingsPage() {
  const { academicYear, setAcademicYear, handleNavigate } = useAppContext();
  return (
    <SettingsView
      onNavigate={handleNavigate} 
      academicYear={academicYear}
      onUpdateAcademicYear={setAcademicYear}
    />
  );
}
