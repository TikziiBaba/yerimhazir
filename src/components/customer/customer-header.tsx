'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Sparkles,
  LogOut,
  User,
  ShoppingBag,
  CreditCard,
  CalendarCheck2,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Store,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CustomerHeaderProps {
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CustomerHeader({ user, activeTab, onTabChange }: CustomerHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Oturum kapatıldı', {
        description: 'Güvenli bir şekilde çıkış yapıldı.',
      });
      router.push('/giris');
    } catch {
      router.push('/giris');
    }
  };

  const navItems = [
    { id: 'gecmis-hizmetler', label: 'Geçmiş Hizmetler', icon: ShoppingBag },
    { id: 'harcamalar', label: 'Harcama & Ödemeler', icon: CreditCard },
    { id: 'yaklasan-randevular', label: 'Yaklaşan Randevular', icon: CalendarCheck2 },
    { id: 'profil-ayarlar', label: 'Profil & Ayarlar', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/80 shadow-soft backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo & Platform Rozeti */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-md group-hover:shadow-glow-primary transition-all duration-300">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-300 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-gradient-hero">Yerim</span>
                  <span className="text-white">Hazır</span>
                </span>
                <span className="text-[10px] font-medium tracking-wider text-surface-400 uppercase -mt-1 hidden sm:block">
                  Müşteri & Randevu Portalı
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-surface-200/80">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-300 border border-accent-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                Üye Hesabı
              </span>
            </div>
          </div>

          {/* Masaüstü Navigasyon Sekmeleri */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-100/80 p-1.5 rounded-2xl border border-surface-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-surface-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sağ Kullanıcı Aksiyonları */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/ahmet-usta"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-300 hover:text-white bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 px-3 py-2 rounded-xl transition-all"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Yeni Randevu Al</span>
            </Link>

            {/* Kullanıcı Menüsü */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-surface-100 border border-surface-200 hover:border-surface-300 text-surface-200 transition-all text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user.fullName || 'Değerli Müşterimiz'}
                  </span>
                  <span className="text-[10px] text-surface-400 leading-tight">
                    {user.phone || user.email}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs shadow-soft">
                  {(user.fullName ? user.fullName[0] : 'U').toUpperCase()}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-surface-400 pr-0.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-100 border border-surface-200 shadow-elevated p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-surface-200/80 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-surface-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onTabChange('profil-ayarlar');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-surface-300 hover:text-white hover:bg-surface-200/60 transition-colors text-left"
                  >
                    <User className="h-3.5 w-3.5 text-primary-400" />
                    Profil Bilgilerim
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('harcamalar');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-surface-300 hover:text-white hover:bg-surface-200/60 transition-colors text-left"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-accent-400" />
                    Ödeme & Fiş Geçmişi
                  </button>
                  <div className="my-1 border-t border-surface-200/80" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Güvenli Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobil Menü Butonu */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-surface-100 border border-surface-200 text-surface-300 hover:text-white"
              aria-label="Menüyü aç"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobil Açılır Menü */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-surface-200/80 space-y-2">
            <div className="p-3 bg-surface-100 rounded-2xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{user.fullName}</p>
                <p className="text-[11px] text-surface-400">{user.email}</p>
              </div>
              <span className="text-[10px] bg-accent-500/15 text-accent-300 border border-accent-500/30 px-2 py-0.5 rounded-full font-semibold">
                Müşteri
              </span>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-surface-300 hover:bg-surface-200 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-surface-200/80 flex flex-col gap-2">
              <Link
                href="/ahmet-usta"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-500/15 border border-accent-500/30 text-xs font-bold text-accent-300"
              >
                <Store className="h-3.5 w-3.5" />
                Yeni Randevu Al
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
