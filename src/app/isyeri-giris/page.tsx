'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Store,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  UserCheck,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noBusinessFound, setNoBusinessFound] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNoBusinessFound(false);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Giriş başarısız', {
            description: 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
          });
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('E-posta Doğrulanmamış', {
            description: 'Lütfen gelen kutunuzdaki aktivasyon linkine tıklayarak hesabınızı onaylayın.',
          });
        } else if (error.message.toLowerCase().includes('too many requests')) {
          toast.error('Çok Fazla Deneme', {
            description: 'Lütfen birkaç dakika bekleyip tekrar deneyin.',
          });
        } else {
          toast.error('Giriş başarısız', { description: error.message });
        }
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        toast.error('Kullanıcı oturumu doğrulanamadı.');
        return;
      }

      try {
        const { data: businessData, error: bError } = await supabase
          .from('businesses')
          .select('id, name, approval_status, slug')
          .eq('owner_id', userId)
          .maybeSingle();

        if (!bError && !businessData) {
          setNoBusinessFound(true);
          toast.warning('İşletme Kaydı Bulunamadı', {
            description: 'Bu e-posta ile kayıtlı bir dükkan bulunmuyor. Yeni işletme kaydı oluşturabilirsiniz.',
          });
          return;
        }

        if (businessData?.approval_status === 'pending') {
          toast.info(`Hoş Geldiniz, ${businessData.name || 'İşletme Sahibi'}!`, {
            description: 'İşletmeniz onay sürecindedir. Yönetim panelinizden tüm hazırlıklarınızı yapabilirsiniz.',
          });
        } else {
          toast.success('Giriş başarılı!', {
            description: `${businessData?.name || 'İşletmeniz'} yönetim paneline aktarılıyorsunuz...`,
          });
        }
      } catch {
        toast.success('Giriş başarılı!');
      }

      router.push('/dashboard');
    } catch {
      toast.error('Bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Demo / Hızlı Test Girişi
  const handleDemoLogin = () => {
    toast.success('Demo işletme paneli açılıyor...', {
      description: 'Ahmet Usta Berber paneli başlatılıyor.',
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-surface-50 px-4 py-12 sm:py-16 relative overflow-hidden">
      {/* Lüks Arka Plan Efektleri */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-primary-500/20 via-primary-700/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-accent-500/15 via-indigo-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto z-10">
        {/* Üst Navigasyon & Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-lg group-hover:shadow-glow-primary transition-all duration-300">
              <Calendar className="h-6 w-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent-300 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-gradient-hero">Yerim</span>
                <span className="text-white">Hazır</span>
              </span>
              <span className="block text-[11px] font-semibold text-primary-300 tracking-wider uppercase">
                İşletme Yönetim Merkezi
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold shadow-soft">
            <Building2 className="h-3.5 w-3.5 text-primary-400" />
            <span>Esnaf, Kuaför, Berber & İşletme Girişi</span>
          </div>
        </div>

        {/* Ana Giriş Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-elevated p-6 sm:p-9 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200/60">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                İşletme Girişi Yap
              </h1>
              <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
                Dükkanınızı, randevu takviminizi ve canlı sıranızı yönetin
              </p>
            </div>
            <div className="hidden sm:flex h-10 w-10 rounded-xl bg-primary-500/10 border border-primary-500/20 items-center justify-center text-primary-400">
              <Store className="h-5 w-5" />
            </div>
          </div>

          {/* İşletme Bulunamadı Uyarısı */}
          {noBusinessFound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Store className="h-4 w-4" />
                İşletme Kaydınız Henüz Tamamlanmadı
              </div>
              <p className="text-surface-300 leading-relaxed">
                Girdiğiniz e-posta ile kayıtlı aktif bir dükkan bulunamadı. Yeni bir işletme hesabı açarak 14 gün ücretsiz başlayabilirsiniz.
              </p>
              <Link
                href="/isyeri-kayit"
                className="inline-flex items-center gap-1.5 font-bold text-accent-400 hover:text-accent-300 pt-1"
              >
                Hemen İşletme Kaydınızı Başlatın <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-posta */}
            <div>
              <label htmlFor="b-email" className="block text-xs sm:text-sm font-semibold text-surface-300 mb-1.5">
                Kayıtlı İşletme E-postası
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="b-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="ahmetusta@berber.com"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="b-password" className="block text-xs sm:text-sm font-semibold text-surface-300">
                  Hesap Şifresi
                </label>
                <Link href="/sifre-sifirla" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="b-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3.5 pl-10 pr-11 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-glow-primary hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Store className="h-4 w-4" />
                  <span>İşletme Paneline Giriş Yap</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Tek Tıkla Test/Demo Girişi */}
          <div className="mt-5 pt-5 border-t border-surface-200/60">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-surface-200/90 bg-surface-200/40 hover:bg-surface-200/80 text-xs sm:text-sm font-semibold text-surface-200 hover:text-white transition-all shadow-sm"
            >
              <Zap className="h-4 w-4 text-accent-400" />
              <span>⚡ Tek Tıkla Demo İşletme Paneline Giriş Yap</span>
            </button>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* KULLANICININ İSTEDİĞİ ALTA KAYIT OL A YÖNLENDİREN BÜYÜK VE ŞIK BUTON      */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 rounded-3xl bg-gradient-to-br from-primary-500/15 via-surface-100 to-accent-500/10 border-2 border-primary-500/35 p-6 sm:p-7 shadow-elevated text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs font-bold mb-2.5 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              14 Gün Ücretsiz Deneme — Kredi Kartı Gerekmez
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Henüz YerimHazır İşletmeniz Yok mu?
            </h2>

            <p className="text-xs sm:text-sm text-surface-300 mb-5 max-w-md mx-auto leading-relaxed">
              Defter ve ajandayı çöpe atın. 60 saniyede online randevu sayfanızı ve canlı sıranızı hemen kurun.
            </p>

            {/* BÜYÜK KAYIT OL BUTONU */}
            <Link
              href="/isyeri-kayit"
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-primary-500 to-accent-500 p-4 text-base sm:text-lg font-black text-white shadow-lg hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <Store className="h-5 w-5 text-white" />
              <span>Hemen Ücretsiz İşletme Kaydı Oluştur</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>

            {/* Özellik Rozetleri */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[11px] text-surface-400 font-medium">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>60 sn Kurulum</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>SMS & WhatsApp</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>QR Masa Kartı</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alt Ek Link (Bireysel Müşteri) */}
        <div className="mt-6 flex items-center justify-center text-xs text-surface-400">
          <Link
            href="/giris"
            className="hover:text-white transition-colors flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-surface-200/40"
          >
            <UserCheck className="h-3.5 w-3.5 text-primary-400" />
            <span>Müşteri misiniz? Bireysel Randevu Takip Girişi Yapın</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
