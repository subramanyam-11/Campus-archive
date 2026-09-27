import { MainLayout } from '@/src/components/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
