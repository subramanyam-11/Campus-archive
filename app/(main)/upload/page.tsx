'use client';
import { UploadDataView } from '@/src/views/UploadDataView';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  return (
    <UploadDataView
      onNavigate={(path) => router.push(`/${path}`)} 
      onImportComplete={() => router.push('/events')} 
    />
  );
}
