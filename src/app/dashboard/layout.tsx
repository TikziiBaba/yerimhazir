'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  QrCode,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Store,
  ShieldCheck,
  Clock,
  Tv,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const SIDEBAR_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Genel Bakış' },
  { href: '/dashboard/randevular', icon: CalendarDays, label: 'Randevular' },
  { href: '/dashboard/hizmetler', icon: Scissors, label: 'Hizmetler' },
  { href: '/dashboard/personel', icon: Users, label: 'Personel' },
  { href: '/dashboard/qr-kod', icon: QrCode, label: 'QR Masa Kartı' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Fatura & Paket' },
  { href: '/dashboard/ayarlar', icon: Settings, label: 'İşletme Ayarları' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<{
    name: string;
    slug: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    email?: string;
  }>({
    name: 'Ahmet Usta Berber',
    slug: 'ahmet-usta',
    approvalStatus: 'pending',
  });

  useEffect(() => {
    async function loadUserBusiness() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: bData } = await supabase
            .from('businesses')
            .select('name, slug, approval_status')
            .eq('owner_id', authData.user.id)
            .maybeSingle();

          if (bData) {
            setBusinessInfo({
              name: bData.name,
              slug: bData.slug || 'isletmem',
              approvalStatus: (bData.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
              email: authData.user.email,
            });
          } else {
            setBusinessInfo((prev) => ({
              ...prev,
              email: authData.user.email,
            }));
          }
        }
      } catch {
        // demo / fallback
      }
    }
    loadUserBusiness();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/isyeri-giris';
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-700">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-surface-200/80 shadow-soft">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-200/80"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5 text-surface-500" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-surface-900" style={{ fontFamily: 'var(--font-display)' }}>
              YerimHazır
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/${businessInfo.slug}`}
              target="_blank"
              className="p-1.5 rounded-lg border border-surface-200 text-xs text-primary-400 flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-surface-100 border-r border-surface-200 shadow-xl"
            >
              <SidebarContent
                pathname={pathname}
                businessInfo={businessInfo}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[260px] lg:flex-col bg-surface-100 border-r border-surface-200">
        <SidebarContent
          pathname={pathname}
          businessInfo={businessInfo}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  businessInfo,
  onClose,
  onLogout,
}: {
  pathname: string;
  businessInfo: {
    name: string;
    slug: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    email?: string;
  };
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-surface-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-surface-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
            <Calendar className="h-5 w-5 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-400" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-gradient-hero">Yerim</span>
            <span className="text-surface-900">Hazır</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-200/60 lg:hidden">
            <X className="h-5 w-5 text-surface-500" />
          </button>
        )}
      </div>

      {/* İşletme Profil Kartı */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-surface-200/40 border border-surface-200">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Store className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-surface-900 truncate">
              {businessInfo.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {businessInfo.approvalStatus === 'approved' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Onaylı
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <Clock className="h-3 w-3" /> Onay Bekliyor
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/${businessInfo.slug}`}
            target="_blank"
            title="Dükkan Sayfasını Gör"
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-surface-200 transition-colors shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm font-semibold'
                  : 'text-surface-500 hover:bg-surface-200/60 hover:text-surface-900'
              )}
            >
              <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-primary-400' : 'text-surface-500')} />
              {item.label}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 space-y-2">
        {businessInfo.email && (
          <div className="px-3 text-[11px] text-surface-400 truncate">
            {businessInfo.email}
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
