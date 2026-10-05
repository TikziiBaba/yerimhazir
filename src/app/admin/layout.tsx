import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yönetici Paneli - Platform Yönetim Merkezi | YerimHazır',
  description: 'YerimHazır SaaS Platform Süper Yönetici Konsolu. İşletme onayları, canlı randevu akışı, finans ve sistem kontrolleri.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
