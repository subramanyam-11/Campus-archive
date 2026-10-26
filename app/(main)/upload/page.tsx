'use client';
import { UploadDataView } from '@/src/views/UploadDataView';
import { useAppContext } from '@/src/components/AppContext';

export default function UploadPage() {
  const { handleNavigate } = useAppContext();
  return (
    <UploadDataView
      onNavigate={handleNavigate} 
      onImportComplete={() => handleNavigate('events')} 
    />
  );
}
