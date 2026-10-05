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
  User,
  ArrowRight,
  Store,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<'customer' | 'business'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Giriş başarısız', {
            description: 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
          });
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('E-posta Onayı Gerekli', {
            description: 'Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın.',
          });
        } else if (error.message.toLowerCase().includes('too many requests')) {
          toast.error('Çok Fazla Deneme', {
            description: 'Güvenlik nedeniyle işlem sınırlandı. Lütfen birkaç dakika sonra deneyin.',
          });
        } else {
          toast.error('Giriş başarısız', { description: error.message });
        }
        return;
      }

      if (roleTab === 'business') {
        toast.success('Giriş başarılı!', {
          description: 'İşletme yönetim paneline yönlendiriliyorsunuz...',
        });
        router.push('/dashboard');
      } else {
        toast.success('Giriş başarılı!', {
          description: 'Hesabınıza hoş geldiniz. Randevularınız yükleniyor...',
        });
        router.push('/hesabim');
      }
    } catch {
      toast.error('Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoDashboard = () => {
    if (roleTab === 'business') {
      toast.success('Demo işletme paneli başlatılıyor...', {
        description: 'Yerel test modunda dükkan paneli açılıyor.',
      });
      router.push('/dashboard');
    } else {
      toast.success('Demo üye paneli başlatılıyor...', {
        description: 'Geçmiş hizmetler ve harcama dökümünüz açılıyor.',
      });
      router.push('/hesabim');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden">
      {/* Arka plan deseni */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-primary-500/15 via-primary-700/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-accent-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-md">
              <Calendar className="h-6 w-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-300" />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-gradient-hero">Yerim</span>
              <span className="text-white">Hazır</span>
            </span>
          </Link>
        </div>

        {/* Form Kartı */}
        <div className="rounded-3xl bg-surface-100/90 border border-surface-200 shadow-elevated p-7 sm:p-8 backdrop-blur-xl">
          {/* Rol Seçici Sekmeler (Müşteri vs İşletme) */}
          <div className="grid grid-cols-2 p-1 bg-surface-200/60 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRoleTab('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                roleTab === 'customer'
                  ? 'bg-surface-50 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <User className="h-4 w-4 text-accent-400" />
              Müşteri Girişi
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('business');
                router.push('/isyeri-giris');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                roleTab === 'business'
                  ? 'bg-surface-50 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4 text-primary-400" />
              İşletme Girişi
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            {roleTab === 'business' ? 'İşletme Paneline Hoş Geldiniz' : 'Müşteri Girişi'}
          </h1>
          <p className="text-xs sm:text-sm text-surface-400 text-center mb-6">
            {roleTab === 'business'
              ? 'Randevularınızı ve dükkanınızı yönetmek için giriş yapın'
              : 'Randevularınızı görüntüleyin ve takip edin'}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-surface-300 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-surface-300">
                  Şifre
                </label>
                <Link href="/sifre-sifirla" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-10 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-glow-primary hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Test / Demo Kolaylığı */}
          <div className="mt-4 pt-4 border-t border-surface-200/60">
            <button
              type="button"
              onClick={handleDemoDashboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-surface-200/80 hover:bg-surface-200/50 text-xs font-semibold text-surface-300 hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              {roleTab === 'business'
                ? 'Demo İşletme Panelini Önizle'
                : 'Demo Müşteri Panelini Önizle (Hizmetler & Harcamalar)'}
            </button>
          </div>
        </div>

        {/* Kayıt linkleri & İşyeri Yönlendirme */}
        <div className="mt-6 space-y-3 text-center text-xs sm:text-sm">
          <p className="text-surface-400">
            Henüz bir müşteri hesabınız yok mu?{' '}
            <Link href="/kayit" className="font-bold text-primary-400 hover:text-primary-300">
              Hemen Kayıt Ol
            </Link>
          </p>

          <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <Store className="h-4 w-4 text-primary-400 shrink-0" />
              <span className="text-xs text-surface-300 font-medium">Esnaf / İşletme misiniz?</span>
            </div>
            <Link
              href="/isyeri-giris"
              className="text-xs font-bold text-accent-400 hover:text-accent-300 underline underline-offset-2"
            >
              İşyeri Girişi &rarr;
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
