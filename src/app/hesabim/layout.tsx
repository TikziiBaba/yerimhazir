import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Müşteri Paneli & Randevularım | YerimHazır',
  description: 'Önceden aldığınız hizmetler, ödediğiniz tutarlar, randevu geçmişiniz ve aktif rezervasyonlarınız.',
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-700 selection:bg-primary-500/30 selection:text-white">
      {children}
    </div>
  );
}
