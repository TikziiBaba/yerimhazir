'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Menu,
  X,
  Store,
  LogIn,
  ArrowRight,
  User,
  ShoppingBag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/kesfet', label: 'Keşfet & Randevu Al', badge: 'Yeni' },
  { href: '/#ozellikler', label: 'Özellikler' },
  { href: '/#sektorler', label: 'Sektörler' },
  { href: '/#nasil-calisir', label: 'Nasıl Çalışır?' },
  { href: '/#fiyatlandirma', label: 'Fiyatlandırma' },
  { href: '/#sss', label: 'SSS' },
];

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            role: user.user_metadata?.role || 'customer',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Hesabım',
          });
        }
      } catch {
        // no auth
      }
    }
    checkAuth();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-surface-200/80 shadow-soft backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Logo */}
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
                  Akıllı Randevu & Sıra Sistemi
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-semibold text-surface-400 hover:text-white transition-colors"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Butonları - Sade, Prestijli ve Doğru */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                /* Giriş Yapmış Kullanıcı Butonları */
                currentUser.role === 'business_owner' ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 rounded-xl shadow-soft hover:shadow-glow-primary transition-all"
                  >
                    <Store className="h-4 w-4" />
                    <span>İşletme Paneli</span>
                  </Link>
                ) : (
                  <Link
                    href="/hesabim"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 rounded-xl shadow-soft hover:shadow-glow-primary transition-all"
                  >
                    <ShoppingBag className="h-4 w-4 text-accent-200" />
                    <span>Randevularım & Hesabım</span>
                  </Link>
                )
              ) : (
                /* Giriş Yapmamış Ziyaretçi Butonları */
                <>
                  {/* Müşteri Girişi */}
                  <Link
                    href="/giris"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-surface-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-surface-200/50 transition-all"
                  >
                    <LogIn className="h-4 w-4 text-surface-400" />
                    <span>Giriş Yap</span>
                  </Link>

                  {/* İşyeri Girişi (Esnaf & Dükkan) */}
                  <Link
                    href="/isyeri-giris"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-300 hover:text-white bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 hover:border-primary-400/50 px-4 py-2.5 rounded-xl shadow-soft hover:shadow-glow-primary transition-all duration-300"
                  >
                    <Store className="h-4 w-4 text-primary-400" />
                    <span>İşyeri Girişi</span>
                  </Link>

                  {/* İşyeri Kaydı (14 Gün Ücretsiz) */}
                  <Link
                    href="/isyeri-kayit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-glow-primary hover:from-primary-600 hover:to-accent-600 transition-all duration-300 group whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 text-accent-200 group-hover:rotate-12 transition-transform" />
                    <span>İşyerini Kaydet</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {currentUser ? (
                <Link
                  href={currentUser.role === 'business_owner' ? '/dashboard' : '/hesabim'}
                  className="text-xs font-bold text-white bg-primary-500 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Panelim</span>
                </Link>
              ) : (
                <Link
                  href="/isyeri-giris"
                  className="text-xs font-bold text-primary-300 bg-primary-500/15 border border-primary-500/30 px-3 py-1.5 rounded-lg"
                >
                  İşyeri Girişi
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-surface-200/70 border border-surface-300/50 text-surface-300 hover:text-white hover:bg-surface-200 transition-colors"
                aria-label="Menüyü aç/kapat"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="glass md:hidden border-b border-surface-200/80 shadow-elevated overflow-hidden backdrop-blur-2xl"
          >
            <div className="px-5 py-5 space-y-3.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-medium text-surface-300 hover:text-white transition-colors py-1.5"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-3 border-t border-surface-200/80 space-y-2.5">
                {currentUser ? (
                  <Link
                    href={currentUser.role === 'business_owner' ? '/dashboard' : '/hesabim'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-white py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 shadow-md"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{currentUser.role === 'business_owner' ? 'İşletme Yönetim Paneli' : 'Randevularım & Hesabım'}</span>
                  </Link>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/giris"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-200 bg-surface-100/90 text-xs font-semibold text-surface-200 hover:bg-surface-200 transition-colors"
                      >
                        <LogIn className="h-3.5 w-3.5 text-surface-400" />
                        Giriş Yap
                      </Link>
                      <Link
                        href="/isyeri-giris"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500/15 border border-primary-500/30 text-xs font-bold text-primary-300 hover:bg-primary-500/25 transition-colors"
                      >
                        <Store className="h-3.5 w-3.5" />
                        İşyeri Girişi
                      </Link>
                    </div>

                    <Link
                      href="/isyeri-kayit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-white py-3.5 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 shadow-md"
                    >
                      <Sparkles className="h-4 w-4 text-accent-200" />
                      İşyerini Kaydet (14 Gün Ücretsiz)
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
