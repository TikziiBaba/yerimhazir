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
  User,
  Phone,
  ArrowRight,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'customer',
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          toast.error('Bu e-posta adresi zaten kayıtlı.', {
            description: 'Lütfen giriş yapın veya şifrenizi sıfırlayın.',
          });
        } else {
          toast.error('Kayıt başarısız', { description: error.message });
        }
        return;
      }

      toast.success('Hesabınız oluşturuldu!', {
        description: 'Giriş yapabilir ve randevularınızı takip edebilirsiniz.',
      });
      router.push('/giris');
    } catch {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent-500/15 via-primary-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-md">
              <Calendar className="h-5 w-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-300" />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-gradient-hero">Yerim</span>
              <span className="text-white">Hazır</span>
            </span>
          </Link>
        </div>

        {/* Esnaf / İşletme Sahibi Dikkat Kutusu */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-primary-500/20 via-surface-100 to-accent-500/15 border border-primary-500/35 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/20 text-primary-300 shrink-0 mt-0.5">
              <Store className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                İşletme / Dükkan Sahibi misiniz?
              </h3>
              <p className="text-xs text-surface-400 leading-relaxed">
                Randevu almak, çalışma saatlerini belirlemek ve esnaf paneline erişmek için işyeri kaydı oluşturmalısınız.
              </p>
              <Link
                href="/isyeri-kayit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-400 hover:text-accent-300 pt-1"
              >
                14 Gün Ücretsiz İşyeri Kaydı Başlat <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bireysel Müşteri Form Kartı */}
        <div className="rounded-3xl bg-surface-100/90 border border-surface-200 shadow-elevated p-7 sm:p-8 backdrop-blur-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            Müşteri Hesabı Oluştur
          </h1>
          <p className="text-xs sm:text-sm text-surface-400 text-center mb-6">
            Favori işletmelerinizden kolayca randevu alın ve takip edin
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Ad Soyad */}
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-surface-300 mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-surface-300 mb-1.5">
                Telefon Numarası
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="0532 123 45 67"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-surface-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50/80 py-3 pl-10 pr-10 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  placeholder="En az 6 karakter"
                  minLength={6}
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-glow-primary hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>
        </div>

        {/* Giriş Yap Linki */}
        <p className="text-center text-xs sm:text-sm text-surface-400 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-semibold text-primary-400 hover:text-primary-300">
            Giriş Yapın
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
