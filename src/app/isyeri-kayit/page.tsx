'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Clock,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Trash2,
  Plus,
  FileText,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { registerBusinessAction, signUpBusinessUserAction } from '@/app/actions';
import { BUSINESS_CATEGORIES, DAY_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BusinessCategory, DayOfWeek, WorkingHours } from '@/lib/supabase/types';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { num: 1, label: 'Hesap' },
  { num: 2, label: 'İşyeri' },
  { num: 3, label: 'Konum' },
  { num: 4, label: 'Görseller' },
  { num: 5, label: 'Saatler' },
  { num: 6, label: 'Özet' },
];

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  tuesday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  wednesday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  thursday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  friday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  saturday: { open: '09:00', close: '18:00', breaks: [], is_open: true },
  sunday: { open: null, close: null, breaks: [], is_open: false },
};

const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne',
  'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman',
  'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli',
  'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli',
  'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

export default function BusinessRegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Adım 1 - Hesap
  const [account, setAccount] = useState({
    ownerName: '',
    ownerPhone: '',
    email: '',
    password: '',
  });

  // Adım 2 - İşyeri bilgileri
  const [business, setBusiness] = useState({
    name: '',
    category: '' as BusinessCategory | '',
    description: '',
    taxNumber: '',
    businessPhone: '',
  });

  // Adım 3 - Konum
  const [location, setLocation] = useState({
    address: '',
    city: '',
    district: '',
  });

  // Adım 4 - Görseller
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Adım 5 - Çalışma saatleri
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [slotDuration, setSlotDuration] = useState(30);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBannerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGalleryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkingDay = (day: DayOfWeek, field: string, value: string | boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Validasyon
  const isStep1Valid = account.ownerName && account.ownerPhone && account.email && account.password.length >= 6;
  const isStep2Valid = business.name && business.category && business.businessPhone;
  const isStep3Valid = location.address && location.city && location.district;

  const nextStep = () => {
    if (step === 1 && !isStep1Valid) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    if (step === 2 && !isStep2Valid) {
      toast.error('İşyeri adı, kategori ve telefon zorunludur.');
      return;
    }
    if (step === 3 && !isStep3Valid) {
      toast.error('Adres, şehir ve ilçe zorunludur.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 6) as Step);
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let userId: string | null = null;

      // 1. Kullanıcı hesabını sunucu tarafında güvenle oluştur (Database error saving new user ve email-confirm korumalı)
      const serverAuth = await signUpBusinessUserAction({
        email: account.email,
        password: account.password,
        ownerName: account.ownerName,
        ownerPhone: account.ownerPhone,
      });

      if (serverAuth.success && serverAuth.userId) {
        userId = serverAuth.userId;
        // İstemcide oturumu aç
        await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
      } else if (serverAuth.code === 'ALREADY_REGISTERED' || (serverAuth.error && serverAuth.error.toLowerCase().includes('already'))) {
        // Kullanıcı zaten varsa şifresiyle oturum açmayı dene
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        if (signInError) {
          toast.error('Bu e-posta adresi sistemde kayıtlı. Lütfen şifrenizi kontrol edin.', {
            description: signInError.message,
          });
          return;
        }
        userId = signInData.user?.id || null;
      } else {
        // Klasik istemci kaydını yedek olarak dene
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              full_name: account.ownerName,
              phone: account.ownerPhone,
              role: 'business_owner',
            },
          },
        });

        if (authError) {
          toast.error('Hesap oluşturulamadı', { description: authError.message });
          return;
        }
        userId = authData.user?.id || null;
      }

      if (!userId) {
        toast.error('Kullanıcı hesabı doğrulanamadı.');
        return;
      }

      // 2. Server Action ile işletme kaydını oluştur (Admin rolü ile RLS bypass)
      const res = await registerBusinessAction({
        userId,
        businessName: business.name,
        category: business.category as BusinessCategory,
        description: business.description || undefined,
        address: location.address,
        city: location.city,
        district: location.district,
        phone: business.businessPhone,
        taxNumber: business.taxNumber || undefined,
        ownerName: account.ownerName,
        ownerPhone: account.ownerPhone,
        workingHours,
        slotDuration,
        logoUrl: logoPreview || undefined,
        bannerUrl: bannerPreview || undefined,
        galleryUrls: galleryPreviews.length > 0 ? galleryPreviews : undefined,
      });

      if (!res.success) {
        toast.error('İşletme kaydedilemedi', { description: res.error });
        return;
      }

      setSubmitted(true);
      toast.success('Başvurunuz alındı!');
    } catch {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Başvuru gönderildi ekranı
  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="rounded-3xl bg-surface-100 border border-surface-200 shadow-elevated p-8 sm:p-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 mb-6">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Başvurunuz Alındı! 🎉
            </h1>
            <p className="text-sm text-surface-500 mb-6 leading-relaxed">
              İşyeri başvurunuz başarıyla kaydedildi. Yetkili ekibimiz en kısa sürede
              <strong className="text-surface-800"> {account.ownerPhone}</strong> numarasını arayarak
              bilgilerinizi doğrulayacak ve hesabınızı onaylayacaktır.
            </p>

            <div className="rounded-2xl bg-surface-200/40 border border-surface-300/50 p-5 mb-6 text-left space-y-3">
              <h3 className="text-sm font-bold text-surface-800 mb-2">Onay Süreci</h3>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-400">1</span>
                </div>
                <p className="text-sm text-surface-500">
                  Ekibimiz verdiğiniz telefon numarasını arayacak
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-400">2</span>
                </div>
                <p className="text-sm text-surface-500">
                  İşyeri bilgileriniz doğrulanacak ve güvenlik soruları sorulacak
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-sm text-surface-500">
                  Onaylandıktan sonra panele giriş yapabilirsiniz
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-surface-200/60 border border-surface-300/60 px-5 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-200 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                href="/giris"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 px-4 py-8 sm:py-12">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
              <Calendar className="h-5 w-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-400" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-gradient-hero">Yerim</span>
              <span className="text-surface-900">Hazır</span>
            </span>
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-bold text-surface-900 mt-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            İşyeri Kaydı
          </h1>
          <p className="text-sm text-surface-500 mt-2">
            İşyerinizi sisteme kaydedin, onay sürecinden geçin ve randevu almaya başlayın
          </p>
        </div>

        {/* Adım Göstergesi */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      step > s.num
                        ? 'bg-emerald-500 text-white shadow-md'
                        : step === s.num
                        ? 'bg-primary-500 text-white shadow-glow-primary'
                        : 'bg-surface-100 border border-surface-200 text-surface-500'
                    )}
                  >
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-1.5 font-medium hidden sm:block',
                      step >= s.num ? 'text-surface-700' : 'text-surface-500'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 rounded-full transition-all duration-300',
                      step > s.num ? 'bg-emerald-500' : 'bg-surface-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Kartı */}
        <div className="rounded-3xl bg-surface-100/90 border border-surface-200 shadow-elevated overflow-hidden">
          <AnimatePresence mode="wait">
            {/* =========== ADIM 1: HESAP BİLGİLERİ =========== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">Hesap Bilgileri</h2>
                    <p className="text-xs text-surface-500">İşyeri sahibi olarak giriş yapacağınız bilgiler</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Ad Soyad <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="ownerName"
                        type="text"
                        value={account.ownerName}
                        onChange={(e) => setAccount((p) => ({ ...p, ownerName: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="Ahmet Yılmaz"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ownerPhone" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Telefon <span className="text-red-400">*</span>
                      <span className="text-xs text-surface-500 ml-1">(Onay için aranacak)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="ownerPhone"
                        type="tel"
                        value={account.ownerPhone}
                        onChange={(e) => setAccount((p) => ({ ...p, ownerPhone: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="0532 123 45 67"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                      E-posta <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="email"
                        type="email"
                        value={account.email}
                        onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Şifre <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={account.password}
                        onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-10 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="En az 6 karakter"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========== ADIM 2: İŞYERİ BİLGİLERİ =========== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-accent-500/15 border border-accent-500/25 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-accent-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">İşyeri Bilgileri</h2>
                    <p className="text-xs text-surface-500">İşyerinizin temel bilgilerini girin</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="bizName" className="block text-sm font-medium text-surface-700 mb-1.5">
                      İşyeri Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="bizName"
                      type="text"
                      value={business.name}
                      onChange={(e) => setBusiness((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      placeholder="Ahmet Usta Berber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Kategori <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.entries(BUSINESS_CATEGORIES) as [BusinessCategory, { label: string; emoji: string }][]).map(
                        ([key, cat]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setBusiness((p) => ({ ...p, category: key }))}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left',
                              business.category === key
                                ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                                : 'border-surface-200 bg-surface-50 text-surface-500 hover:border-surface-300'
                            )}
                          >
                            <span className="text-lg">{cat.emoji}</span>
                            <span className="truncate text-xs">{cat.label}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bizPhone" className="block text-sm font-medium text-surface-700 mb-1.5">
                      İşyeri Telefonu <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="bizPhone"
                        type="tel"
                        value={business.businessPhone}
                        onChange={(e) => setBusiness((p) => ({ ...p, businessPhone: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="0212 123 45 67"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Vergi Numarası <span className="text-xs text-surface-500">(İsteğe bağlı)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        id="taxNumber"
                        type="text"
                        value={business.taxNumber}
                        onChange={(e) => setBusiness((p) => ({ ...p, taxNumber: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bizDesc" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Açıklama <span className="text-xs text-surface-500">(İsteğe bağlı)</span>
                    </label>
                    <textarea
                      id="bizDesc"
                      value={business.description}
                      onChange={(e) => setBusiness((p) => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                      rows={3}
                      placeholder="İşyeriniz hakkında kısa bir açıklama..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========== ADIM 3: KONUM BİLGİLERİ =========== */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">Konum Bilgileri</h2>
                    <p className="text-xs text-surface-500">Müşterilerinizin sizi bulabilmesi için adresinizi girin</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Şehir <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="city"
                      value={location.city}
                      onChange={(e) => setLocation((p) => ({ ...p, city: e.target.value }))}
                      className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-surface-700 mb-1.5">
                      İlçe / Semt <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="district"
                      type="text"
                      value={location.district}
                      onChange={(e) => setLocation((p) => ({ ...p, district: e.target.value }))}
                      className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      placeholder="Kadıköy"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-surface-700 mb-1.5">
                      Açık Adres <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={location.address}
                      onChange={(e) => setLocation((p) => ({ ...p, address: e.target.value }))}
                      className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                      rows={3}
                      placeholder="Caferağa Mah. Moda Cad. No:42, Kadıköy"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========== ADIM 4: GÖRSELLER =========== */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">Görseller</h2>
                    <p className="text-xs text-surface-500">Logo, banner ve işyeri fotoğraflarınızı yükleyin (isteğe bağlı)</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">İşyeri Logosu</label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-surface-200/50 border-2 border-dashed border-surface-300 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-full w-full object-cover rounded-2xl" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-surface-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200/60 border border-surface-300/60 text-sm font-medium text-surface-700 hover:bg-surface-200 cursor-pointer transition-colors">
                          <Upload className="h-4 w-4" />
                          Logo Yükle
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        </label>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" /> Kaldır
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Banner / Kapak Fotoğrafı</label>
                    <div className="relative rounded-2xl bg-surface-200/50 border-2 border-dashed border-surface-300 overflow-hidden">
                      {bannerPreview ? (
                        <div className="relative">
                          <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => setBannerPreview(null)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-surface-200/30 transition-colors">
                          <Upload className="h-8 w-8 text-surface-400 mb-2" />
                          <span className="text-sm text-surface-500">Banner fotoğrafı yükleyin</span>
                          <span className="text-xs text-surface-400 mt-0.5">Önerilen boyut: 1200x400</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Galeri */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      İşyeri Galeri Fotoğrafları
                      <span className="text-xs text-surface-500 ml-1">(Maks. 8 adet)</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {galleryPreviews.map((img, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                          <img src={img} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {galleryPreviews.length < 8 && (
                        <label className="rounded-xl border-2 border-dashed border-surface-300 bg-surface-200/30 flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-surface-200/50 transition-colors">
                          <Plus className="h-6 w-6 text-surface-400" />
                          <span className="text-[10px] text-surface-500 mt-1">Ekle</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========== ADIM 5: ÇALIŞMA SAATLERİ =========== */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">Çalışma Saatleri</h2>
                    <p className="text-xs text-surface-500">Randevu slotlarının oluşturulacağı çalışma saatlerini ayarlayın</p>
                  </div>
                </div>

                {/* Slot süresi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-surface-700 mb-2">Randevu Slot Süresi</label>
                  <div className="flex gap-2 flex-wrap">
                    {[15, 30, 45, 60].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSlotDuration(dur)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                          slotDuration === dur
                            ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                            : 'border-surface-200 bg-surface-50 text-surface-500 hover:border-surface-300'
                        )}
                      >
                        {dur} dk
                      </button>
                    ))}
                  </div>
                </div>

                {/* Günler */}
                <div className="space-y-3">
                  {(Object.keys(DAY_NAMES) as DayOfWeek[]).map((day) => (
                    <div
                      key={day}
                      className={cn(
                        'rounded-xl border p-3 transition-all',
                        workingHours[day].is_open
                          ? 'border-surface-200 bg-surface-50/50'
                          : 'border-surface-200/50 bg-surface-200/20 opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateWorkingDay(day, 'is_open', !workingHours[day].is_open)}
                            className={cn(
                              'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors',
                              workingHours[day].is_open
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-surface-300 bg-surface-100'
                            )}
                          >
                            {workingHours[day].is_open && <Check className="h-3 w-3 text-white" />}
                          </button>
                          <span className="text-sm font-semibold text-surface-800">{DAY_NAMES[day]}</span>
                        </div>

                        {workingHours[day].is_open && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={workingHours[day].open || '09:00'}
                              onChange={(e) => updateWorkingDay(day, 'open', e.target.value)}
                              className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400"
                            />
                            <span className="text-xs text-surface-500">—</span>
                            <input
                              type="time"
                              value={workingHours[day].close || '19:00'}
                              onChange={(e) => updateWorkingDay(day, 'close', e.target.value)}
                              className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400"
                            />
                          </div>
                        )}

                        {!workingHours[day].is_open && (
                          <span className="text-xs text-surface-500 italic">Kapalı</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* =========== ADIM 6: ÖZET =========== */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-surface-900">Başvuru Özeti</h2>
                    <p className="text-xs text-surface-500">Bilgilerinizi kontrol edin ve başvurunuzu gönderin</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Hesap */}
                  <div className="rounded-xl bg-surface-200/40 border border-surface-300/50 p-4">
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Hesap</h3>
                    <div className="space-y-1.5">
                      <SummaryRow label="Ad Soyad" value={account.ownerName} />
                      <SummaryRow label="Telefon" value={account.ownerPhone} />
                      <SummaryRow label="E-posta" value={account.email} />
                    </div>
                  </div>

                  {/* İşyeri */}
                  <div className="rounded-xl bg-surface-200/40 border border-surface-300/50 p-4">
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">İşyeri</h3>
                    <div className="space-y-1.5">
                      <SummaryRow label="İşyeri Adı" value={business.name} />
                      <SummaryRow
                        label="Kategori"
                        value={business.category ? BUSINESS_CATEGORIES[business.category as BusinessCategory]?.label : '-'}
                      />
                      <SummaryRow label="Telefon" value={business.businessPhone} />
                      {business.taxNumber && <SummaryRow label="Vergi No" value={business.taxNumber} />}
                    </div>
                  </div>

                  {/* Konum */}
                  <div className="rounded-xl bg-surface-200/40 border border-surface-300/50 p-4">
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Konum</h3>
                    <div className="space-y-1.5">
                      <SummaryRow label="Şehir" value={location.city} />
                      <SummaryRow label="İlçe" value={location.district} />
                      <SummaryRow label="Adres" value={location.address} />
                    </div>
                  </div>

                  {/* Çalışma Saatleri */}
                  <div className="rounded-xl bg-surface-200/40 border border-surface-300/50 p-4">
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Çalışma Saatleri</h3>
                    <div className="space-y-1.5">
                      {(Object.keys(DAY_NAMES) as DayOfWeek[]).map((day) => (
                        <SummaryRow
                          key={day}
                          label={DAY_NAMES[day]}
                          value={workingHours[day].is_open ? `${workingHours[day].open} - ${workingHours[day].close}` : 'Kapalı'}
                        />
                      ))}
                      <SummaryRow label="Slot Süresi" value={`${slotDuration} dakika`} />
                    </div>
                  </div>

                  {/* Onay uyarısı */}
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-surface-600">
                      <p className="font-semibold text-amber-300 mb-1">Onay Süreci</p>
                      <p className="text-xs leading-relaxed text-surface-500">
                        Başvurunuz gönderildikten sonra ekibimiz <strong className="text-surface-700">{account.ownerPhone}</strong>{' '}
                        numarasını arayacak, işyeri bilgilerinizi doğrulayacak ve hesabınızı onaylayacaktır.
                        Bu süre genellikle 1 iş günü içinde tamamlanır.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alt navigasyon butonları */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-surface-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Geri
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all"
              >
                Devam Et
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Başvuru Gönder
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Zaten hesabım var linki */}
        <p className="text-center text-sm text-surface-500 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-semibold text-primary-400 hover:text-primary-300">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-surface-500">{label}</span>
      <span className="font-medium text-surface-800 text-right max-w-[60%] break-words">{value || '—'}</span>
    </div>
  );
}
