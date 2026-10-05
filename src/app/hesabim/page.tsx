'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CalendarCheck2,
  Clock,
  MapPin,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  RotateCcw,
  Star,
  Download,
  Filter,
  ArrowRight,
  TrendingUp,
  Gift,
  QrCode,
  Building2,
  Scissors,
  Car,
  Footprints,
  Shirt,
  HelpCircle,
  Check,
  User,
  Shield,
  FileSpreadsheet,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { CustomerHeader } from '@/components/customer/customer-header';
import { ReceiptModal, type ReceiptData } from '@/components/customer/receipt-modal';
import { ReviewModal } from '@/components/customer/review-modal';
import { CancelAppointmentModal } from '@/components/customer/cancel-appointment-modal';
import { updateCustomerProfileAction } from '@/app/actions';

// Müşteri Randevu / Hizmet Veri Tipi
export interface CustomerAppointment {
  id: string;
  businessName: string;
  businessSlug: string;
  businessAddress: string;
  businessPhone: string;
  category: 'barber' | 'car_wash' | 'sports_pitch' | 'tailor' | 'beauty_salon' | 'other';
  serviceName: string;
  staffName: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  paidAmount: number;
  paymentMethod: 'Kredi Kartı' | 'Nakit' | 'Online Depozito' | 'Havale/EFT';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  status: 'completed' | 'confirmed' | 'pending' | 'canceled';
  receiptNumber: string;
  userRating?: number | null;
  userReview?: string | null;
  cancellationReason?: string | null;
}

// Zengin, gerçekçi başlangıç verileri (Önceden alınan hizmetler ve ödenen paralar)
const INITIAL_CUSTOMER_SERVICES: CustomerAppointment[] = [];

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState('gecmis-hizmetler');
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{
    id: string;
    businessName: string;
    serviceName: string;
    currentRating?: number | null;
  } | null>(null);
  const [cancellingItem, setCancellingItem] = useState<{
    id: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
  } | null>(null);

  // Arama & Filtreleme Durumları
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'confirmed' | 'canceled'>('all');

  // Kullanıcı Profili Durumu
  const [currentUser, setCurrentUser] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
  });

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    smsNotifications: true,
    emailReceipts: true,
    whatsappReminders: true,
  });

  // Supabase Oturumu Yükleme
  useEffect(() => {
    async function loadAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';
          const phone = user.user_metadata?.phone || '';
          const email = user.email || '';

          setCurrentUser({
            id: user.id,
            fullName: name,
            email: email,
            phone: phone,
          });

          setProfileForm((prev) => ({
            ...prev,
            fullName: name,
            phone: phone,
            email: email,
          }));

          // Veritabanında gerçek randevuları kontrol et
          const { data: dbAppointments } = await supabase
            .from('appointments')
            .select('*, businesses(name, slug, category, address, phone), services(name, price, duration_minutes), staff(name)')
            .or(`customer_email.eq.${email},customer_phone.eq.${phone}`)
            .order('start_time', { ascending: false });

          if (dbAppointments && dbAppointments.length > 0) {
            const mapped: CustomerAppointment[] = dbAppointments.map((item: any) => {
              const startDate = new Date(item.start_time);
              const dateStr = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
              const timeStr = startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

              return {
                id: item.id,
                businessName: item.businesses?.name || 'Yerel İşletme',
                businessSlug: item.businesses?.slug || 'ahmet-usta',
                businessAddress: item.businesses?.address || 'İstanbul',
                businessPhone: item.businesses?.phone || '0532 000 00 00',
                category: (item.businesses?.category as any) || 'barber',
                serviceName: item.services?.name || 'Standart Hizmet',
                staffName: item.staff?.name || null,
                date: dateStr,
                time: timeStr,
                durationMinutes: item.services?.duration_minutes || 30,
                price: Number(item.total_amount) || Number(item.services?.price) || 200,
                paidAmount: item.payment_status === 'paid' ? (Number(item.total_amount) || 200) : 0,
                paymentMethod: item.payment_status === 'paid' ? 'Kredi Kartı' : 'Nakit',
                paymentStatus: (item.payment_status as any) || 'pending',
                status: (item.status as any) || 'confirmed',
                receiptNumber: `YH-2026-${item.id.slice(0, 4).toUpperCase()}`,
              };
            });

            setAppointments(mapped);
          } else {
            setAppointments([]);
          }
        }
      } catch {
        // Fallback demo
      }
    }

    loadAuth();
  }, []);

  // Finansal ve İstatistiksel Hesaplamalar
  const stats = useMemo(() => {
    const completedApts = appointments.filter((a) => a.status === 'completed');
    const totalSpent = completedApts.reduce((sum, a) => sum + (a.paidAmount || a.price), 0);
    const upcomingCount = appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length;
    const loyaltyPoints = Math.round(totalSpent * 0.1); // Her 10 TL harcamaya 1 puan

    // Sektörel Dağılım
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    completedApts.forEach((apt) => {
      const cat = apt.category || 'other';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, count: 0 };
      }
      categoryTotals[cat].total += apt.paidAmount || apt.price;
      categoryTotals[cat].count += 1;
    });

    return {
      totalSpent,
      completedCount: completedApts.length,
      upcomingCount,
      loyaltyPoints,
      categoryTotals,
    };
  }, [appointments]);

  // Filtrelenmiş Randevular
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Sekmeye göre ön filtreleme
      if (activeTab === 'yaklasan-randevular') {
        if (apt.status !== 'confirmed' && apt.status !== 'pending') return false;
      }

      // Kategori Filtresi
      if (categoryFilter !== 'all' && apt.category !== categoryFilter) {
        return false;
      }

      // Durum Filtresi
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      // Metin Arama
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = apt.businessName.toLowerCase().includes(query);
        const matchesService = apt.serviceName.toLowerCase().includes(query);
        const matchesStaff = apt.staffName?.toLowerCase().includes(query);
        if (!matchesName && !matchesService && !matchesStaff) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, activeTab, categoryFilter, statusFilter, searchQuery]);

  // Fiş / Dekont Gösterme
  const handleOpenReceipt = (apt: CustomerAppointment) => {
    const receiptData: ReceiptData = {
      id: apt.id,
      receiptNumber: apt.receiptNumber,
      businessName: apt.businessName,
      businessAddress: apt.businessAddress,
      businessPhone: apt.businessPhone,
      serviceName: apt.serviceName,
      staffName: apt.staffName,
      date: apt.date,
      time: apt.time,
      durationMinutes: apt.durationMinutes,
      price: apt.paidAmount || apt.price,
      paymentMethod: apt.paymentMethod,
      paymentStatus: 'Tahsil Edildi',
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
    };
    setSelectedReceipt(receiptData);
  };

  // Randevu İptali
  const handleConfirmCancel = (id: string, reason: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, status: 'canceled', cancellationReason: reason }
          : apt
      )
    );
    toast.success('Randevunuz iptal edildi', {
      description: 'İşletmeye iptal bilgilendirmesi iletildi.',
    });
  };

  // Yorum Kaydetme
  const handleSaveReview = (id: string, rating: number, comment: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, userRating: rating, userReview: comment }
          : apt
      )
    );
  };

  // Profil Güncelleme Formu
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomerProfileAction({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      });
      setCurrentUser((prev) => ({
        ...prev,
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      }));
      toast.success('Profil bilgileriniz güncellendi');
    } catch {
      toast.error('Profil kaydedilirken hata oluştu.');
    }
  };

  // Harcama Raporunu Dışa Aktarma
  const handleExportCSV = () => {
    const headers = 'Tarih;Fiş No;İşletme;Hizmet;Ödenen Tutar (TL);Ödeme Yöntemi;Durum\n';
    const rows = appointments
      .filter((a) => a.status === 'completed')
      .map(
        (a) =>
          `"${a.date}";"${a.receiptNumber}";"${a.businessName}";"${a.serviceName}";"${a.paidAmount}";"${a.paymentMethod}";"Tamamlandı"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `YerimHazir-Harcama-Gecmisi-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Harcama özeti Excel/CSV olarak indirildi');
  };

  // Sektör İkonu Yardımcısı
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'barber':
        return <Scissors className="h-4 w-4 text-indigo-400" />;
      case 'car_wash':
        return <Car className="h-4 w-4 text-cyan-400" />;
      case 'sports_pitch':
        return <Footprints className="h-4 w-4 text-emerald-400" />;
      case 'tailor':
        return <Shirt className="h-4 w-4 text-amber-400" />;
      default:
        return <Building2 className="h-4 w-4 text-primary-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'barber':
        return 'Berber & Kuaför';
      case 'car_wash':
        return 'Oto Yıkama & Detailing';
      case 'sports_pitch':
        return 'Halı Saha & Spor';
      case 'tailor':
        return 'Terzi & Tadilat';
      case 'beauty_salon':
        return 'Güzellik Salonu';
      default:
        return 'Diğer Esnaf';
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-700">
      {/* Müşteri Portalı Başlığı */}
      <CustomerHeader
        user={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Ana Gövde */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Kullanıcı Karşılama & Hızlı Bilgi Bannerı */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-100 via-surface-100 to-primary-950/30 border border-surface-200 p-6 sm:p-8 shadow-elevated">
          {/* Arka plan ışıltıları */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Hoş Geldiniz, {currentUser.fullName} 👋
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Check className="h-3 w-3" />
                  Doğrulanmış Üye
                </span>
              </div>
              <p className="text-xs sm:text-sm text-surface-400 max-w-2xl leading-relaxed">
                Bu panel üzerinden önceden aldığınız hizmetleri, ödediğiniz toplam parayı, fiş ve dekontlarınızı inceleyebilir, yaklaşan randevularınızı yönetebilirsiniz.
              </p>
            </div>

            {/* Hızlı Aksiyon Butonu */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/kesfet"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all duration-300 group"
              >
                <Sparkles className="h-4 w-4 text-accent-200 group-hover:rotate-12 transition-transform" />
                <span>Yeni Randevu Oluştur</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Önemli Metrik / KPI Kartları (Harcama, Hizmet Sayısı, Aktif Randevu, Puan) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. ÖDENEN TOPLAM PARA */}
          <div className="rounded-3xl bg-surface-100 border border-surface-200/90 p-5 shadow-card relative overflow-hidden group hover:border-primary-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                Ödenen Toplam Para
              </span>
              <div className="p-2.5 rounded-2xl bg-primary-500/15 text-primary-300 border border-primary-500/25">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                ₺{stats.totalSpent.toLocaleString('tr-TR')}
              </div>
              <p className="text-[11px] text-surface-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>{stats.completedCount} tamamlanan hizmet üzerinden</span>
              </p>
            </div>
          </div>

          {/* 2. ALINAN HİZMET SAYISI */}
          <div className="rounded-3xl bg-surface-100 border border-surface-200/90 p-5 shadow-card relative overflow-hidden group hover:border-accent-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                Alınan Hizmetler
              </span>
              <div className="p-2.5 rounded-2xl bg-accent-500/15 text-accent-300 border border-accent-500/25">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {stats.completedCount} Hizmet
              </div>
              <p className="text-[11px] text-surface-400">
                Berber, oto yıkama, halı saha & terzi
              </p>
            </div>
          </div>

          {/* 3. YAKLAŞAN RANDEVU */}
          <div className="rounded-3xl bg-surface-100 border border-surface-200/90 p-5 shadow-card relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                Yaklaşan Randevu
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {stats.upcomingCount} Aktif
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                En yakın: 3 Ekim Cuma, 15:00
              </p>
            </div>
          </div>

          {/* 4. SADAKAT / YERİMPUAN */}
          <div className="rounded-3xl bg-surface-100 border border-surface-200/90 p-5 shadow-card relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                YerimPuan Bakiyesi
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <Gift className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
                {stats.loyaltyPoints} Puan
              </div>
              <p className="text-[11px] text-surface-400">
                Sonraki randevunuzda ₺50 indirim değerinde
              </p>
            </div>
          </div>
        </section>

        {/* Sekme Seçici Çubuk */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-surface-100 rounded-2xl border border-surface-200">
            <button
              onClick={() => setActiveTab('gecmis-hizmetler')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'gecmis-hizmetler'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Geçmiş Hizmetlerim ({stats.completedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('harcamalar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'harcamalar'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Harcama Raporu</span>
            </button>

            <button
              onClick={() => setActiveTab('yaklasan-randevular')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'yaklasan-randevular'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>Yaklaşan Randevular ({stats.upcomingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('profil-ayarlar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'profil-ayarlar'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profil & Ayarlar</span>
            </button>
          </div>

          {/* Hızlı Rapor Dışa Aktarma Butonu */}
          {activeTab === 'harcamalar' && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-surface-200 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Excel/CSV İndir</span>
            </button>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SEKME 1: GEÇMİŞ HİZMETLERİM & ÖNCEDEN ALINAN HİZMETLER                   */}
        {/* ========================================================================= */}
        {activeTab === 'gecmis-hizmetler' && (
          <div className="space-y-6">
            {/* Arama ve Filtre Kontrolleri */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Metin Arama */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hizmet, personel veya işletme adı ara..."
                  className="w-full rounded-2xl border border-surface-200 bg-surface-100 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-surface-200 placeholder:text-surface-500 focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Sektör Filtresi Çipleri */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Tüm Sektörler' },
                  { id: 'barber', label: 'Berber' },
                  { id: 'car_wash', label: 'Oto Yıkama' },
                  { id: 'sports_pitch', label: 'Halı Saha' },
                  { id: 'tailor', label: 'Terzi' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40 font-semibold'
                        : 'bg-surface-100 text-surface-400 border border-surface-200 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hizmet Kartları Listesi */}
            {filteredAppointments.length === 0 ? (
              <div className="rounded-3xl bg-surface-100 border border-surface-200 p-12 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-200/60 text-surface-400 mb-2">
                  <Filter className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Kriterlere uygun hizmet bulunamadı</h3>
                <p className="text-xs text-surface-400 max-w-sm mx-auto">
                  Arama filtrenizi temizleyerek veya farklı bir anahtar kelime yazarak tekrar deneyebilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-200 text-xs font-semibold text-white hover:bg-surface-300 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => {
                  const isCompleted = apt.status === 'completed';
                  const isConfirmed = apt.status === 'confirmed';
                  const isCanceled = apt.status === 'canceled';

                  return (
                    <div
                      key={apt.id}
                      className="rounded-3xl bg-surface-100 border border-surface-200/90 p-5 sm:p-6 shadow-card hover:border-surface-300 transition-all space-y-4"
                    >
                      {/* Üst Bilgi: İşletme ve Durum */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-surface-200/70">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-surface-200/80 border border-surface-300/40 flex items-center justify-center shrink-0">
                            {getCategoryIcon(apt.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                {apt.businessName}
                              </h4>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-200 text-surface-400 border border-surface-300/40">
                                {getCategoryLabel(apt.category)}
                              </span>
                            </div>
                            <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-surface-500" />
                              <span>{apt.businessAddress}</span>
                            </p>
                          </div>
                        </div>

                        {/* Durum Rozeti */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Tamamlandı
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/15 text-primary-300 border border-primary-500/30">
                              <CalendarCheck2 className="h-3.5 w-3.5" />
                              Yaklaşan Randevu
                            </span>
                          )}
                          {isCanceled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                              <AlertCircle className="h-3.5 w-3.5" />
                              İptal Edildi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Orta Gövde: Hizmet Adı, Personel, Tarih, Saat ve Ödenen Tutar */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Hizmet & Personel */}
                        <div className="md:col-span-2 space-y-1.5">
                          <h5 className="text-sm font-bold text-surface-100 sm:text-base text-white">
                            {apt.serviceName}
                          </h5>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                            {apt.staffName && (
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-primary-400" />
                                <span>Usta / Personel: <strong className="text-surface-200">{apt.staffName}</strong></span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-surface-500" />
                              <span>{apt.date}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-surface-500" />
                              <span>{apt.time} ({apt.durationMinutes} dk)</span>
                            </span>
                          </div>
                        </div>

                        {/* ÖDENEN PARA / TUTAR KUTUSU */}
                        <div className="p-3.5 rounded-2xl bg-surface-200/50 border border-surface-300/40 flex items-center justify-between md:justify-end md:gap-4">
                          <div className="text-left md:text-right">
                            <span className="text-[11px] text-surface-400 block">
                              {isCompleted ? 'Ödenen Tutar' : 'Hizmet Bedeli'}
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-white font-mono">
                              ₺{apt.paidAmount || apt.price}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md block">
                              {apt.paymentMethod}
                            </span>
                            <span className="text-[10px] text-surface-500 mt-0.5 block">
                              Fiş: {apt.receiptNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Değerlendirme Varsa Göster */}
                      {apt.userRating && (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-surface-300 flex items-start gap-2.5">
                          <div className="flex items-center text-amber-400 shrink-0 mt-0.5">
                            {Array.from({ length: apt.userRating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <p className="italic text-surface-300">
                            &ldquo;{apt.userReview}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Alt Aksiyon Butonları */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-200/70">
                        <div className="flex items-center gap-2">
                          {/* Fiş / Dekont Göster */}
                          <button
                            onClick={() => handleOpenReceipt(apt)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-200/70 hover:bg-surface-200 text-xs font-semibold text-surface-200 hover:text-white transition-colors"
                          >
                            <Receipt className="h-3.5 w-3.5 text-accent-400" />
                            <span>Dekont / Fiş Gör</span>
                          </button>

                          {/* Değerlendirme Butonu */}
                          {isCompleted && (
                            <button
                              onClick={() =>
                                setReviewingItem({
                                  id: apt.id,
                                  businessName: apt.businessName,
                                  serviceName: apt.serviceName,
                                  currentRating: apt.userRating,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-300/50 hover:bg-surface-200/60 text-xs font-semibold text-surface-300 hover:text-white transition-colors"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-400" />
                              <span>{apt.userRating ? 'Değerlendirmeyi Düzenle' : 'Puanla & Yorum Yap'}</span>
                            </button>
                          )}
                        </div>

                        {/* Tekrar Randevu Al (Rebook) & İptal */}
                        <div className="flex items-center gap-2">
                          {isConfirmed && (
                            <button
                              onClick={() =>
                                setCancellingItem({
                                  id: apt.id,
                                  businessName: apt.businessName,
                                  serviceName: apt.serviceName,
                                  date: apt.date,
                                  time: apt.time,
                                })
                              }
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              Randevuyu İptal Et
                            </button>
                          )}

                          <Link
                            href={`/${apt.businessSlug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 hover:border-primary-400 text-xs font-bold text-primary-300 hover:text-white transition-all shadow-soft"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Tekrar Randevu Al</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 2: HARCAMA & ÖDEME RAPORU (Finansal Döküm)                          */}
        {/* ========================================================================= */}
        {activeTab === 'harcamalar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol: Harcama Özeti Kartı */}
              <div className="rounded-3xl bg-surface-100 border border-surface-200 p-6 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary-400" />
                  Harcama Dağılımı Özeti
                </h3>

                <div className="p-4 rounded-2xl bg-surface-200/50 border border-surface-300/40 space-y-2">
                  <span className="text-xs text-surface-400">Toplam Ödenen Para</span>
                  <div className="text-3xl font-black text-white font-mono">
                    ₺{stats.totalSpent.toLocaleString('tr-TR')}
                  </div>
                  <div className="flex justify-between text-xs text-surface-400 pt-2 border-t border-surface-200/80">
                    <span>Ortalama Hizmet Tutarı:</span>
                    <strong className="text-white">
                      ₺{stats.completedCount ? Math.round(stats.totalSpent / stats.completedCount) : 0}
                    </strong>
                  </div>
                </div>

                {/* Sektörel Yüzdeler */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Sektörlere Göre Harcama
                  </h4>

                  {Object.entries(stats.categoryTotals).map(([cat, val]) => {
                    const pct = Math.round((val.total / (stats.totalSpent || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-surface-300 font-medium">{getCategoryLabel(cat)}</span>
                          <span className="text-white font-mono font-bold">
                            ₺{val.total.toLocaleString('tr-TR')} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tasarruf & Avantaj Notu */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Gift className="h-4 w-4" />
                    YerimHazır Sadakat Avantajı
                  </div>
                  <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                    Harcamalarınız üzerinden kazandığınız {stats.loyaltyPoints} puan ile sonraki randevularınızda indirim hakkı kazandınız.
                  </p>
                </div>
              </div>

              {/* Sağ: Tam Ödeme İşlemleri Tablosu */}
              <div className="lg:col-span-2 rounded-3xl bg-surface-100 border border-surface-200 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-6 border-b border-surface-200/80 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Son Ödeme İşlemleri</h3>
                      <p className="text-xs text-surface-400 mt-0.5">
                        Ödenen tutarlar ve e-fiş kayıtları
                      </p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-300/50 bg-surface-200/40 hover:bg-surface-200 text-xs font-semibold text-surface-200 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-accent-400" />
                      <span>Dışa Aktar</span>
                    </button>
                  </div>

                  {/* Tablo */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-200/40 text-surface-400 border-b border-surface-200/80">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Tarih & Fiş</th>
                          <th className="py-3 px-4 font-semibold">İşletme & Hizmet</th>
                          <th className="py-3 px-4 font-semibold">Ödeme Türü</th>
                          <th className="py-3 px-4 font-semibold text-right">Tutar</th>
                          <th className="py-3 px-4 font-semibold text-right">Dekont</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200/60">
                        {appointments
                          .filter((a) => a.status === 'completed')
                          .map((apt) => (
                            <tr key={apt.id} className="hover:bg-surface-200/30 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-semibold text-white block">{apt.date}</span>
                                <span className="text-[11px] text-surface-400 font-mono">{apt.receiptNumber}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-white block">{apt.businessName}</span>
                                <span className="text-[11px] text-surface-400 truncate max-w-[200px] block">
                                  {apt.serviceName}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-200 text-surface-300 text-[11px]">
                                  {apt.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold text-white font-mono text-sm">
                                  ₺{apt.paidAmount || apt.price}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleOpenReceipt(apt)}
                                  className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-primary-300 hover:text-white transition-colors"
                                  title="Fişi Görüntüle"
                                >
                                  <Receipt className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-surface-200/30 border-t border-surface-200/80 text-xs text-surface-400 text-center">
                  Tüm ödemeler 256-bit SSL koruması ve Bankacılık Düzenleme lisanslı sanal POS altyapısı ile güvendedir.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 3: YAKLAŞAN RANDEVULAR                                             */}
        {/* ========================================================================= */}
        {activeTab === 'yaklasan-randevular' && (
          <div className="space-y-6">
            {appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length === 0 ? (
              <div className="rounded-3xl bg-surface-100 border border-surface-200 p-12 text-center space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400">
                  <CalendarCheck2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Şu anda yaklaşan bir randevunuz bulunmuyor</h3>
                <p className="text-xs sm:text-sm text-surface-400 max-w-md mx-auto">
                  Berber, oto yıkama, halı saha veya terzi için dilediğiniz zaman sıra beklemeden anında randevu alabilirsiniz.
                </p>
                <Link
                  href="/ahmet-usta"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-bold text-white shadow-soft transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Hemen Randevu Bul
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments
                  .filter((a) => a.status === 'confirmed' || a.status === 'pending')
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-3xl bg-surface-100 border-2 border-primary-500/30 p-6 sm:p-7 shadow-elevated relative overflow-hidden space-y-5"
                    >
                      {/* Üst Rozet & Geri Sayım */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check className="h-3.5 w-3.5" />
                          Randevunuz Onaylandı
                        </span>
                        <span className="text-xs font-semibold text-primary-300 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                          ⏳ 2 Gün Sonra
                        </span>
                      </div>

                      {/* İşletme ve Hizmet Bilgisi */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-accent-400" />
                          <h4 className="text-lg font-bold text-white">{apt.businessName}</h4>
                        </div>
                        <p className="text-sm font-medium text-surface-200">{apt.serviceName}</p>
                        {apt.staffName && (
                          <p className="text-xs text-surface-400">
                            İlgilenecek Usta: <strong className="text-white">{apt.staffName}</strong>
                          </p>
                        )}
                      </div>

                      {/* Tarih, Saat & Konum Kutusu */}
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-200/50 border border-surface-300/40 text-xs">
                        <div className="space-y-1">
                          <span className="text-surface-400 block">Tarih & Saat:</span>
                          <span className="font-bold text-white text-sm block">{apt.date}</span>
                          <span className="text-primary-300 font-semibold">{apt.time} ({apt.durationMinutes} dk)</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-surface-400 block">Ödeme Durumu:</span>
                          <span className="font-bold text-white text-sm block">₺{apt.price}</span>
                          <span className="text-surface-400">İşletmede Ödenecek</span>
                        </div>
                      </div>

                      {/* Dükkan Adresi & Harita */}
                      <div className="p-3.5 rounded-2xl bg-surface-200/30 border border-surface-200/60 flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" />
                          <p className="text-surface-300 leading-snug">{apt.businessAddress}</p>
                        </div>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(apt.businessAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-accent-300 hover:text-white font-semibold underline underline-offset-2"
                        >
                          Yol Tarifi
                        </a>
                      </div>

                      {/* Dükkana Varışta QR Check-In Kodu */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-950/40 to-surface-200/40 border border-primary-500/20 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <QrCode className="h-4 w-4 text-primary-400" />
                            Giriş Sıra / QR Kodu
                          </span>
                          <p className="text-[11px] text-surface-400">
                            Dükkana vardığınızda kasaya bu kodu söyleyebilirsiniz.
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-300 text-xs font-mono font-bold text-primary-300">
                          {apt.receiptNumber}
                        </div>
                      </div>

                      {/* Alt İletişim & İptal Butonları */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-200/80">
                        <a
                          href={`tel:${apt.businessPhone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-300/50 hover:bg-surface-200 text-xs font-semibold text-surface-200 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-400" />
                          <span>İşletmeyi Ara</span>
                        </a>

                        <button
                          onClick={() =>
                            setCancellingItem({
                              id: apt.id,
                              businessName: apt.businessName,
                              serviceName: apt.serviceName,
                              date: apt.date,
                              time: apt.time,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          Randevuyu İptal Et
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 4: PROFİL & AYARLAR                                                */}
        {/* ========================================================================= */}
        {activeTab === 'profil-ayarlar' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-surface-100 border border-surface-200 p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-surface-200/80 pb-4">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Kişisel Bilgiler & İletişim Tercihleri
              </h3>
              <p className="text-xs text-surface-400 mt-1">
                Randevu onay SMS&apos;leri ve e-posta dekontlarınız bu bilgiler üzerinden iletilir.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">
                  Adınız ve Soyadınız
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 p-3 text-xs sm:text-sm text-white focus:border-primary-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Telefon Numarası (SMS Onayı İçin)
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 p-3 text-xs sm:text-sm text-white focus:border-primary-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full rounded-xl border border-surface-200/50 bg-surface-200/30 p-3 text-xs sm:text-sm text-surface-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Bildirim Tercihleri */}
              <div className="pt-4 border-t border-surface-200/80 space-y-3">
                <h4 className="text-xs font-bold text-surface-200 uppercase tracking-wider">
                  Otomatik Bildirim Tercihleri
                </h4>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-200/30 border border-surface-200/60 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">SMS Hatırlatmaları</span>
                    <span className="text-[11px] text-surface-400 block">
                      Randevudan 2 saat önce hatırlatma mesajı al
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileForm.smsNotifications}
                    onChange={(e) => setProfileForm({ ...profileForm, smsNotifications: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-200/30 border border-surface-200/60 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">E-Posta Fiş & Dekont</span>
                    <span className="text-[11px] text-surface-400 block">
                      Hizmet tamamlandığında dijital makbuzu e-posta olarak gönder
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileForm.emailReceipts}
                    onChange={(e) => setProfileForm({ ...profileForm, emailReceipts: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-200/30 border border-surface-200/60 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">WhatsApp Randevu Teyidi</span>
                    <span className="text-[11px] text-surface-400 block">
                      Dükkan onayladığında WhatsApp ile konum ve teyit bağlantısı al
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileForm.whatsappReminders}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsappReminders: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary-500"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-bold text-white shadow-soft transition-colors"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODALLAR */}
      {/* 1. Dijital Fiş / Dekont Modalı */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* 2. Değerlendirme & Yorum Modalı */}
      <ReviewModal
        item={reviewingItem}
        onClose={() => setReviewingItem(null)}
        onSubmit={handleSaveReview}
      />

      {/* 3. Randevu İptal Modalı */}
      <CancelAppointmentModal
        item={cancellingItem}
        onClose={() => setCancellingItem(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
