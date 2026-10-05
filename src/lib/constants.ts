import type { BusinessCategory } from '@/lib/supabase/types';

// ========================
// İşletme Kategorileri
// ========================

export const BUSINESS_CATEGORIES: Record<BusinessCategory, { label: string; icon: string; emoji: string }> = {
  barber: { label: 'Berber / Kuaför', icon: 'Scissors', emoji: '✂️' },
  car_wash: { label: 'Oto Yıkama', icon: 'Car', emoji: '🚗' },
  sports_pitch: { label: 'Halı Saha', icon: 'Goal', emoji: '⚽' },
  tattoo_studio: { label: 'Dövme Stüdyosu', icon: 'Palette', emoji: '🎨' },
  tailor: { label: 'Terzi', icon: 'Shirt', emoji: '👔' },
  beauty_salon: { label: 'Güzellik Salonu', icon: 'Sparkles', emoji: '💅' },
  other: { label: 'Diğer', icon: 'Store', emoji: '🏪' },
};

// ========================
// Randevu Durumları
// ========================

export const APPOINTMENT_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Beklemede', color: 'text-amber-400', bgColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  confirmed: { label: 'Onaylandı', color: 'text-blue-400', bgColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  completed: { label: 'Tamamlandı', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  canceled: { label: 'İptal Edildi', color: 'text-red-400', bgColor: 'bg-red-500/10 text-red-300 border-red-500/30' },
  no_show: { label: 'Gelmedi', color: 'text-surface-400', bgColor: 'bg-surface-200 text-surface-400 border-surface-300' },
};

// ========================
// Onay Durumları
// ========================

export const APPROVAL_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  pending: {
    label: 'Onay Bekliyor',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    description: 'Yetkili ekibimiz telefonla arayarak işyeri teyidi gerçekleştirecektir.',
  },
  approved: {
    label: 'Onaylandı (Aktif)',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: 'İşletmeniz aktif ve randevu alabilir durumda.',
  },
  rejected: {
    label: 'Reddedildi',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 text-red-300 border-red-500/30',
    description: 'Başvurunuz onaylanamadı. Lütfen bilgilerinizi kontrol edip yeniden deneyin.',
  },
};

// ========================
// Ödeme Durumları
// ========================

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ödenmedi', color: 'text-amber-400' },
  paid: { label: 'Ödendi', color: 'text-emerald-400' },
  deposit_paid: { label: 'Kapora Alındı', color: 'text-blue-400' },
  cash_on_delivery: { label: 'Gelince Ödenecek', color: 'text-surface-400' },
  refunded: { label: 'İade Edildi', color: 'text-red-400' },
};

// ========================
// Abonelik Planları
// ========================

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Başlangıç',
    monthlyPrice: 249,
    yearlyPrice: 2490, // 2 ay indirimli
    features: [
      'Sınırsız randevu',
      '3 hizmet tanımlama',
      '2 personel/peron',
      'QR kod oluşturucu',
      'SMS hatırlatma (50/ay)',
      'Temel raporlar',
    ],
    limits: {
      services: 3,
      staff: 2,
      sms_per_month: 50,
    },
  },
  pro: {
    name: 'Profesyonel',
    monthlyPrice: 499,
    yearlyPrice: 4990, // 2 ay indirimli
    popular: true,
    features: [
      'Sınırsız randevu',
      'Sınırsız hizmet',
      'Sınırsız personel/peron',
      'QR kod oluşturucu',
      'SMS + WhatsApp hatırlatma (sınırsız)',
      'Gelişmiş raporlar & analizler',
      'Online kapora tahsilatı',
      'Özel alan adı desteği',
      'Öncelikli teknik destek',
    ],
    limits: {
      services: Infinity,
      staff: Infinity,
      sms_per_month: Infinity,
    },
  },
} as const;

// ========================
// Slot Süreleri
// ========================

export const SLOT_DURATIONS = [
  { value: 15, label: '15 dakika' },
  { value: 30, label: '30 dakika' },
  { value: 45, label: '45 dakika' },
  { value: 60, label: '1 saat' },
];

// ========================
// Gün İsimleri (Türkçe)
// ========================

export const DAY_NAMES: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

// ========================
// Site Ayarları
// ========================

export const SITE_CONFIG = {
  name: 'YerimHazır',
  description: 'Yerel esnaflar için modern randevu ve sıra yönetim platformu',
  url: 'https://yerimhazir.com',
  domain: 'yerimhazir.com',
  trialDays: 14,
} as const;
