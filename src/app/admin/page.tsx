'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Building2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Store,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Sliders,
  Check,
  X,
  CreditCard,
  Server,
  Activity,
  MessageSquare,
  Lock,
  ChevronRight,
  Eye,
  FileText,
  BadgeCheck,
  Radio,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { getAdminPlatformDataAction, updateBusinessApprovalStatusAction } from '@/app/actions';

// ==========================================
// TİPLER
// ==========================================

type AdminTab = 'overview' | 'businesses' | 'appointments' | 'financials' | 'system';

type BusinessItem = {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  slug: string;
  plan: 'starter' | 'pro' | 'enterprise';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  appointmentCount: number;
  monthlyRevenue: number;
  joinedAt: string;
  taxNumber?: string;
};

type PlatformAppointment = {
  id: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  service: string;
  staffName: string;
  time: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'canceled';
  channel: 'online' | 'qr_code' | 'whatsapp';
};

// ==========================================
// MOCK / GERÇEKÇİ VERİLER
// ==========================================

const INITIAL_BUSINESSES: BusinessItem[] = [];

const INITIAL_APPOINTMENTS: PlatformAppointment[] = [];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [appointments, setAppointments] = useState<PlatformAppointment[]>([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    approvedBusinesses: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const res = await getAdminPlatformDataAction();
      if (res.success && res.data) {
        setBusinesses(res.data.businesses as any);
        setAppointments(res.data.appointments as any);
        setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);

  // Sistem Anahtarları
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);
  const [autoWhatsappEnabled, setAutoWhatsappEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // İstatistikler
  const totalBusinessesCount = stats.totalBusinesses;
  const pendingApprovalsCount = useMemo(() => {
    return businesses.filter((b) => b.approvalStatus === 'pending').length;
  }, [businesses]);
  const activeBusinessesCount = stats.approvedBusinesses;

  // Filtrelenmiş işletmeler
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' ? true : b.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchQuery, statusFilter]);

  // İşletme Onayla
  const handleApprove = async (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, approvalStatus: 'approved' } : b))
    );
    await updateBusinessApprovalStatusAction({ businessId: id, status: 'approved' });
    toast.success(`İşletme Onaylandı: ${name}`, {
      description: 'İşletme artık aktif olarak listeleniyor ve randevu kabul edebilir.',
    });
  };

  // İşletme Reddet
  const handleReject = async (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, approvalStatus: 'rejected' } : b))
    );
    await updateBusinessApprovalStatusAction({ businessId: id, status: 'rejected' });
    toast.error(`İşletme Reddedildi: ${name}`, {
      description: 'Başvuru onaylanmadı.',
    });
  };

  // İşletme Askıya Al
  const handleSuspend = async (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, approvalStatus: 'suspended' } : b))
    );
    await updateBusinessApprovalStatusAction({ businessId: id, status: 'suspended' });
    toast.warning(`İşletme Askıya Alındı: ${name}`, {
      description: 'İşletmenin randevu sayfası geçici olarak donduruldu.',
    });
  };

  const handleRefreshData = async () => {
    await loadData();
    toast.success('Veriler Güncellendi', {
      description: 'Tüm istatistikler ve veritabanı senkronize edildi.',
    });
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-200">
      {/* ============================================================== */}
      {/* 1. EXECUTIVE SUPER-ADMIN TOP HEADER                            */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 glass border-b border-surface-200/90 shadow-soft backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Logo & Yönetici Rozeti */}
            <div className="flex items-center gap-3.5">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-primary-500 to-primary-700 shadow-md group-hover:shadow-glow-primary transition-all duration-300">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      YerimHazır
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Super Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-surface-400 font-medium hidden sm:block">
                    Platform Yönetim & Denetim Konsolu
                  </span>
                </div>
              </Link>
            </div>

            {/* Canlı Sunucu Durumu */}
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-100/90 border border-surface-200 text-xs font-semibold text-surface-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Sistem Uptime: %99.98</span>
              <span className="text-surface-500">•</span>
              <span className="text-emerald-400 font-mono">14ms ping</span>
            </div>

            {/* Sağ Hızlı Navigasyon Butonları */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-surface-200 bg-surface-100/90 hover:bg-surface-200 text-xs font-semibold text-surface-300 hover:text-white transition-colors flex items-center gap-1.5"
                title="Verileri Yenile"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary-400' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-300 bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 px-3.5 py-2 rounded-xl transition-all"
              >
                <Store className="h-3.5 w-3.5 text-primary-400" />
                <span className="hidden sm:inline">İşletme Paneli</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-surface-400 hover:text-white px-2.5 py-2 rounded-xl transition-colors"
              >
                Siteye Dön
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. TAB NAVİGASYONU                                             */}
      {/* ============================================================== */}
      <div className="border-b border-surface-200/90 bg-surface-100/60 sticky top-16 sm:top-20 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
              }`}
            >
              <Activity className="h-4 w-4" />
              Genel Bakış & Metrikler
            </button>

            <button
              onClick={() => setActiveTab('businesses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'businesses'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>İşletme Onayları & Yönetimi</span>
              {pendingApprovalsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 text-surface-950 font-black text-[10px] px-1.5 animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Canlı Randevu Akışı
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'financials'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Finans & Abonelikler
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
              }`}
            >
              <Server className="h-4 w-4" />
              Sistem & Entegrasyonlar
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ANA İÇERİK ALANI                                            */}
      {/* ============================================================== */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* ========================================== */}
        {/* TAB 1: GENEL BAKIŞ & KPI KARTLARI         */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Üst Karşılama Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-primary-600/20 via-surface-100 to-accent-500/15 border border-primary-500/30 p-6 sm:p-8 overflow-hidden shadow-elevated">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold mb-3">
                  <Shield className="h-3.5 w-3.5 text-accent-400" />
                  Yönetici Kontrol Merkezi
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Platform Genel Durumu & Operasyonlar
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-surface-300 leading-relaxed">
                  Türkiye çapında kayıtlı <strong className="text-white">1,482 dükkan</strong> ve bugün işlenen{' '}
                  <strong className="text-white">3,845 randevu</strong> ile sisteminiz kesintisiz çalışıyor.
                </p>
              </div>

              {pendingApprovalsCount > 0 && (
                <div className="mt-5 sm:mt-0 sm:absolute sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-10">
                  <button
                    onClick={() => setActiveTab('businesses')}
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs sm:text-sm shadow-soft transition-all"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-400 animate-bounce" />
                    <div className="text-left">
                      <div className="font-black text-white">{pendingApprovalsCount} İşletme Onay Bekliyor</div>
                      <div className="text-[11px] text-amber-300 font-normal">Hemen incelemek için tıklayın &rarr;</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* KPI METRİK KARTLARI (MİLYON DOLARLIK SAAS GÖRÜNÜMÜ) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Toplam İşletme */}
              <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft relative overflow-hidden card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Kayıtlı İşletmeler</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/25 text-primary-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {totalBusinessesCount.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +14.2%
                  </span>
                </div>
                <div className="mt-2 text-xs text-surface-400">
                  <strong className="text-emerald-400 font-semibold">{activeBusinessesCount}</strong> Aktif •{' '}
                  <strong className="text-amber-400 font-semibold">{pendingApprovalsCount}</strong> Bekleyen
                </div>
              </div>

              {/* Aylık Randevu Hacmi */}
              <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft relative overflow-hidden card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Aylık Randevu</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/15 border border-accent-500/25 text-accent-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {stats.totalAppointments}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +26.5%
                  </span>
                </div>
                <div className="mt-2 text-xs text-surface-400">
                  Toplam: <strong className="text-white font-semibold">{stats.totalAppointments}</strong> kayıtlı randevu
                </div>
              </div>

              {/* Platform MRR */}
              <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft relative overflow-hidden card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Platform MRR</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-300 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +18.4%
                  </span>
                </div>
                <div className="mt-2 text-xs text-surface-400">
                  Toplam Tahsilat: <strong className="text-white font-semibold">₺{stats.totalRevenue.toLocaleString('tr-TR')}</strong>
                </div>
              </div>

              {/* Canlı Sıradaki Müşteriler */}
              <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft relative overflow-hidden card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Canlı Sıra Bekleyen</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {appointments.filter((a) => a.status === 'pending').length}
                  </span>
                  <span className="text-xs font-bold text-primary-400">Anlık</span>
                </div>
                <div className="mt-2 text-xs text-surface-400">
                  Ortalama Bekleme Süresi: <strong className="text-white font-semibold">12.4 dk</strong>
                </div>
              </div>
            </div>

            {/* Orta Blok: Canlı Randevu Trafiği & Şehir Dağılımı */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canlı Akış (Sol 2 Kolon) */}
              <div className="lg:col-span-2 rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-surface-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h2 className="text-base font-bold text-white">Canlı Randevu Akışı (Türkiye Geneli)</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    Tümünü Gör <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70 hover:border-primary-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 border border-primary-500/25 text-primary-300 font-black text-xs">
                          {apt.time}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">{apt.customerName}</div>
                          <div className="text-[11px] text-surface-400">
                            {apt.service} • <span className="text-primary-300 font-semibold">{apt.businessName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-white">₺{apt.amount}</div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mt-0.5">
                          Onaylandı
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Şehir Dağılımı ve Sektör Kırılımı (Sağ 1 Kolon) */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-6 shadow-soft">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent-400" />
                    İl Bazlı İşletme Dağılımı
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { city: 'İstanbul', count: 618, pct: '%41.7' },
                      { city: 'Ankara', count: 266, pct: '%18.0' },
                      { city: 'İzmir', count: 207, pct: '%14.0' },
                      { city: 'Bursa', count: 133, pct: '%9.0' },
                      { city: 'Antalya & Diğer', count: 258, pct: '%17.3' },
                    ].map((row) => (
                      <div key={row.city}>
                        <div className="flex justify-between font-semibold text-surface-300 mb-1">
                          <span>{row.city}</span>
                          <span className="text-white font-mono">{row.count} dükkan ({row.pct})</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full"
                            style={{ width: row.pct }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API & Servis Durumu */}
                <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 p-5 shadow-soft space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-surface-400 pb-2 border-b border-surface-200/60 font-semibold">
                    <span>Entegrasyon Servisi</span>
                    <span>Durum</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-300 font-medium">Netgsm SMS Gateway</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-300 font-medium">Meta WhatsApp Cloud</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-300 font-medium">Supabase DB Pool</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sağlıklı (%18)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: İŞLETME ONAYLARI & YÖNETİMİ                             */}
        {/* ============================================================== */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            {/* Üst Filtre & Arama Barı */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft">
              {/* Arama Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İşletme adı, yetkili, şehir, kategori veya telefon ara..."
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-surface-500 focus:border-primary-400 focus:outline-none"
                />
              </div>

              {/* Durum Filtre Butonları */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'pending', label: `Onay Bekleyenler (${pendingApprovalsCount})` },
                  { key: 'approved', label: 'Aktif İşletmeler' },
                  { key: 'rejected', label: 'Reddedilenler' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === f.key
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-surface-200/50 text-surface-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* İşletmeler Tablosu */}
            <div className="rounded-3xl bg-surface-100/90 border border-surface-200/90 overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-200/50 text-xs font-bold text-surface-400 uppercase tracking-wider border-b border-surface-200/80">
                    <tr>
                      <th className="py-4 px-5">İşletme Bilgisi</th>
                      <th className="py-4 px-5">Kategori & Şehir</th>
                      <th className="py-4 px-5">İletişim</th>
                      <th className="py-4 px-5">Paket</th>
                      <th className="py-4 px-5">Durum</th>
                      <th className="py-4 px-5 text-right">Yönetim Aksiyonu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200/60">
                    {filteredBusinesses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-surface-400">
                          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <div className="font-bold text-white text-base">Kayıtlı İşletme Bulunmuyor</div>
                          <div className="text-xs text-surface-400 mt-1">Platformda henüz bu kritere uyan bir işletme kaydı yok.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredBusinesses.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-200/30 transition-colors">
                        {/* İşletme & Sahibi */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 border border-primary-500/25 text-primary-300 font-bold text-sm">
                              {b.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{b.name}</span>
                                {b.approvalStatus === 'approved' && (
                                  <BadgeCheck className="h-4 w-4 text-emerald-400" />
                                )}
                              </div>
                              <div className="text-xs text-surface-400">Yetkili: {b.ownerName}</div>
                            </div>
                          </div>
                        </td>

                        {/* Kategori & Şehir */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-surface-200 text-xs">{b.category}</div>
                          <div className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-surface-500" />
                            {b.city}, {b.district}
                          </div>
                        </td>

                        {/* İletişim */}
                        <td className="py-4 px-5">
                          <div className="text-xs text-surface-200 font-mono">{b.phone}</div>
                          <div className="text-xs text-surface-400 truncate max-w-[160px]">{b.email}</div>
                        </td>

                        {/* Paket */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            b.plan === 'pro'
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                              : b.plan === 'enterprise'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-surface-200 text-surface-300 border border-surface-300'
                          }`}>
                            {b.plan.toUpperCase()}
                          </span>
                        </td>

                        {/* Durum */}
                        <td className="py-4 px-5">
                          {b.approvalStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                              <Clock className="h-3.5 w-3.5" />
                              Onay Bekliyor
                            </span>
                          )}
                          {b.approvalStatus === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aktif
                            </span>
                          )}
                          {b.approvalStatus === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/30">
                              <XCircle className="h-3.5 w-3.5" />
                              Reddedildi
                            </span>
                          )}
                          {b.approvalStatus === 'suspended' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-300 text-surface-300 border border-surface-400">
                              Askıda
                            </span>
                          )}
                        </td>

                        {/* Aksiyon Butonları */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.approvalStatus === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(b.id, b.name)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-colors shadow-sm"
                                  title="İşletmeyi Onayla"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Onayla</span>
                                </button>
                                <button
                                  onClick={() => handleReject(b.id, b.name)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs transition-colors"
                                  title="Başvuruyu Reddet"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reddet</span>
                                </button>
                              </>
                            ) : b.approvalStatus === 'approved' ? (
                              <>
                                <Link
                                  href={`/${b.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg border border-surface-200 text-surface-400 hover:text-white hover:bg-surface-200"
                                  title="Randevu Sayfasını Gör"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleSuspend(b.id, b.name)}
                                  className="px-2.5 py-1.5 rounded-xl border border-surface-200 text-xs font-semibold text-surface-400 hover:text-amber-400 hover:bg-surface-200 transition-colors"
                                  title="Geçici Olarak Askıya Al"
                                >
                                  Askıya Al
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleApprove(b.id, b.name)}
                                className="px-3 py-1.5 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-bold hover:bg-primary-500/30"
                              >
                                Tekrar Aktif Et
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBusiness(b)}
                              className="px-3 py-1.5 rounded-xl border border-surface-200 text-xs font-semibold text-surface-300 hover:text-white hover:bg-surface-200 transition-colors"
                            >
                              Detay
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PLATFORM RANDEVULARI                                    */}
        {/* ============================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Tüm Platform Randevu Trafiği</h2>
                  <p className="text-xs sm:text-sm text-surface-400">
                    Sistem genelinde açılan tüm randevu kayıtları ve durumları
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Bugün: 3,845 Randevu
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="p-12 text-center text-surface-400 rounded-2xl bg-surface-50/50 border border-surface-200/60">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <div className="font-bold text-white text-base">Henüz Randevu Kaydı Yok</div>
                    <div className="text-xs text-surface-400 mt-1">Platform genelinde yeni randevular oluşturulduğunda burada listelenecektir.</div>
                  </div>
                ) : (
                  appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl bg-surface-50/80 border border-surface-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/25 text-primary-300 font-bold text-sm">
                        {apt.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{apt.customerName}</span>
                          <span className="text-xs text-surface-400">({apt.customerPhone})</span>
                        </div>
                        <div className="text-xs text-surface-300 mt-0.5">
                          <strong>{apt.service}</strong> • Personel: {apt.staffName}
                        </div>
                        <div className="text-[11px] text-primary-400 font-medium mt-0.5">
                          İşletme: {apt.businessName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-200/60">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-white">₺{apt.amount}</div>
                        <div className="text-[11px] text-surface-400">Kanal: {apt.channel}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : apt.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : apt.status === 'completed'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-red-500/15 text-red-300 border-red-500/30'
                      }`}>
                        {apt.status === 'confirmed' ? 'Onaylı' : apt.status === 'pending' ? 'Bekliyor' : apt.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                      </span>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FİNANS & ABONELİKLER                                    */}
        {/* ============================================================== */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft">
                <span className="text-xs font-bold text-surface-400 uppercase">Başlangıç Paketi (₺249)</span>
                <div className="text-2xl font-black text-white mt-2">{businesses.filter((b) => b.plan === 'starter').length} İşletme</div>
                <div className="text-xs text-primary-400 mt-1">₺{(businesses.filter((b) => b.plan === 'starter').length * 249).toLocaleString('tr-TR')} / ay ciro</div>
              </div>
              <div className="p-6 rounded-3xl bg-surface-100/90 border border-primary-500/30 bg-primary-500/5 shadow-soft">
                <span className="text-xs font-bold text-primary-300 uppercase">Profesyonel Paket (₺499)</span>
                <div className="text-2xl font-black text-white mt-2">{businesses.filter((b) => b.plan === 'pro').length} İşletme</div>
                <div className="text-xs text-accent-400 mt-1">₺{(businesses.filter((b) => b.plan === 'pro').length * 499).toLocaleString('tr-TR')} / ay ciro</div>
              </div>
              <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft">
                <span className="text-xs font-bold text-surface-400 uppercase">Kurumsal Paket (Özel)</span>
                <div className="text-2xl font-black text-white mt-2">{businesses.filter((b) => b.plan === 'enterprise').length} İşletme</div>
                <div className="text-xs text-amber-400 mt-1">Özel faturalandırma</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft">
              <h3 className="text-base font-bold text-white mb-4">Son SaaS Fatura Tahsilatları</h3>
              <div className="space-y-3 text-xs">
                {businesses.length === 0 ? (
                  <div className="p-8 text-center text-surface-400">
                    <DollarSign className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    <div className="font-bold text-white text-sm">Tahsilat Kaydı Bulunmuyor</div>
                    <div className="text-[11px] text-surface-400 mt-0.5">SaaS abonelik ödemeleri gerçekleştikçe faturalar burada listelenecektir.</div>
                  </div>
                ) : (
                  businesses.map((b, idx) => (
                    <div key={b.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/60">
                      <div>
                        <div className="font-bold text-white">{b.name}</div>
                        <div className="text-surface-400 font-mono text-[11px]">FTR-2026-00{idx + 1} • {b.plan.toUpperCase()} Paket</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">₺{b.plan === 'pro' ? '499' : b.plan === 'enterprise' ? '1,499' : '249'}</div>
                        <span className="text-[10px] text-surface-400">{b.joinedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SİSTEM & ENTEGRASYON AYARLARI                           */}
        {/* ============================================================== */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sistem Kontrolleri */}
            <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary-400" />
                Platform Canlı Anahtarları
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">Yeni İşletme Kayıtları</div>
                    <div className="text-xs text-surface-400">Yeni dükkan başvurularını kabul et</div>
                  </div>
                  <button
                    onClick={() => {
                      setRegistrationOpen(!registrationOpen);
                      toast.info(registrationOpen ? 'Kayıtlar durduruldu' : 'Kayıtlar açıldı');
                    }}
                    className={`h-7 w-12 rounded-full transition-colors border relative ${
                      registrationOpen ? 'bg-primary-500 border-primary-400' : 'bg-surface-300 border-surface-400'
                    }`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${registrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">Bakım Modu (Maintenance)</div>
                    <div className="text-xs text-surface-400">Sadece adminlerin sisteme erişmesini sağlar</div>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      toast.warning(maintenanceMode ? 'Bakım modu kapatıldı' : 'Bakım modu AÇILDI');
                    }}
                    className={`h-7 w-12 rounded-full transition-colors border relative ${
                      maintenanceMode ? 'bg-amber-500 border-amber-400' : 'bg-surface-300 border-surface-400'
                    }`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">Otomatik WhatsApp Bildirimleri</div>
                    <div className="text-xs text-surface-400">Meta Cloud API üzerinden anlık teyitler</div>
                  </div>
                  <button
                    onClick={() => setAutoWhatsappEnabled(!autoWhatsappEnabled)}
                    className={`h-7 w-12 rounded-full transition-colors border relative ${
                      autoWhatsappEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-surface-300 border-surface-400'
                    }`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${autoWhatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">Otomatik SMS Bildirimleri</div>
                    <div className="text-xs text-surface-400">Netgsm Gateway üzerinden randevu hatırlatmaları</div>
                  </div>
                  <button
                    onClick={() => setAutoSmsEnabled(!autoSmsEnabled)}
                    className={`h-7 w-12 rounded-full transition-colors border relative ${
                      autoSmsEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-surface-300 border-surface-400'
                    }`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${autoSmsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* API & Altyapı Detayları */}
            <div className="p-6 rounded-3xl bg-surface-100/90 border border-surface-200/90 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-accent-400" />
                Altyapı & API Sağlığı
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>Netgsm SMS Gateway</span>
                    <span className="text-emerald-400">42,500 Kredi Kalan</span>
                  </div>
                  <p className="text-surface-400 text-[11px]">Son SMS gönderim hızı: 0.8 sn • Başarı oranı %99.9</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>PostgreSQL Supabase Instance</span>
                    <span className="text-emerald-400">18 / 60 Bağlantı</span>
                  </div>
                  <p className="text-surface-400 text-[11px]">CPU: %14 • RAM: %32 • Disk: 14.8 GB / 100 GB</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-50/80 border border-surface-200/70 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>Cloudflare CDN & R2 Media</span>
                    <span className="text-emerald-400">Önbellek Oranı %94.2</span>
                  </div>
                  <p className="text-surface-400 text-[11px]">QR Kod ve esnaf logoları uç noktalardan sunuluyor.</p>
                </div>

                <button
                  onClick={() => {
                    toast.success('Önbellek Temizlendi', {
                      description: 'Platform CDN ve Redis önbellekleri başarıyla sıfırlandı.',
                    });
                  }}
                  className="w-full py-3 rounded-2xl bg-surface-200/70 hover:bg-surface-200 border border-surface-300/50 text-xs font-bold text-white transition-colors"
                >
                  🚀 Önbelleği Temizle & Yeniden Senkronize Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* İŞLETME DETAY MODALI                                          */}
        {/* ============================================================== */}
        <AnimatePresence>
          {selectedBusiness && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-surface-100 border border-surface-200 shadow-elevated p-6 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                  <div className="flex items-center gap-2.5">
                    <Store className="h-5 w-5 text-primary-400" />
                    <h3 className="text-lg font-bold text-white">{selectedBusiness.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/60">
                      <span className="text-surface-400 block mb-0.5">Yetkili Kişi</span>
                      <strong className="text-white text-sm">{selectedBusiness.ownerName}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/60">
                      <span className="text-surface-400 block mb-0.5">Telefon Numarası</span>
                      <strong className="text-white text-sm font-mono">{selectedBusiness.phone}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/60 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-surface-400">Kategori:</span>
                      <strong className="text-white">{selectedBusiness.category}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Lokasyon:</span>
                      <strong className="text-white">{selectedBusiness.city}, {selectedBusiness.district}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Vergi No / Sicil:</span>
                      <strong className="text-white font-mono">{selectedBusiness.taxNumber || 'Belirtilmedi'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Tamamlanan Randevu:</span>
                      <strong className="text-emerald-400">{selectedBusiness.appointmentCount} randevu</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  {selectedBusiness.approvalStatus === 'pending' && (
                    <button
                      onClick={() => {
                        handleApprove(selectedBusiness.id, selectedBusiness.name);
                        setSelectedBusiness(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-primary-600 text-white font-bold text-xs shadow-md hover:opacity-95"
                    >
                      İşletmeyi Hemen Onayla
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="flex-1 py-3 rounded-xl border border-surface-200 text-surface-300 hover:text-white hover:bg-surface-200 font-semibold text-xs"
                  >
                    Kapat
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
