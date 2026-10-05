'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ExternalLink,
  CalendarDays,
  Clock,
  Wallet,
  Users,
  Check,
  CheckCheck,
  X,
  MessageCircle,
  Scissors,
  QrCode,
  Tv,
  Settings,
  ChevronRight,
  AlertCircle,
  Store,
  Loader2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { createAppointment, updateAppointmentStatus } from '@/app/actions';

// ==========================================
// Tipler
// ==========================================

type AptStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

type AppointmentItem = {
  id: string;
  startTime: string;
  time: string;
  customerName: string;
  customerPhone: string;
  service: string;
  staff: string | null;
  price: number;
  status: AptStatus;
};

type ServiceOption = { id: string; name: string; price: number; duration: number };
type StaffOption = { id: string; name: string };

type BusinessInfo = {
  id: string;
  name: string;
  slug: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
};

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed';

// ==========================================
// Sabitler & Yardımcılar
// ==========================================

const STATUS_META: Record<AptStatus, { label: string; className: string }> = {
  pending: { label: 'Bekliyor', className: 'bg-amber-400/10 text-amber-300' },
  confirmed: { label: 'Onaylı', className: 'bg-primary-500/15 text-primary-300' },
  completed: { label: 'Tamamlandı', className: 'bg-emerald-400/10 text-emerald-300' },
  canceled: { label: 'İptal', className: 'bg-surface-200 text-surface-400' },
  no_show: { label: 'Gelmedi', className: 'bg-surface-200 text-surface-400' },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Bekleyen' },
  { key: 'confirmed', label: 'Onaylı' },
  { key: 'completed', label: 'Tamamlanan' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function toLocalDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!digits.startsWith('90')) digits = `90${digits}`;
  return `https://wa.me/${digits}`;
}

const formatTL = (n: number) => `₺${n.toLocaleString('tr-TR')}`;

// ==========================================
// Sayfa
// ==========================================

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  );

  // Supabase verilerini yükle
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        const { data: bData } = await supabase
          .from('businesses')
          .select('id, name, slug, approval_status')
          .eq('owner_id', authData.user.id)
          .maybeSingle();

        if (!bData) return;

        setBusiness({
          id: bData.id,
          name: bData.name,
          slug: bData.slug,
          approvalStatus: (bData.approval_status as BusinessInfo['approvalStatus']) || 'pending',
        });

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const [{ data: sData }, { data: stData }, aptRes] = await Promise.all([
          supabase
            .from('services')
            .select('id, name, price, duration_minutes')
            .eq('business_id', bData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('staff')
            .select('id, name')
            .eq('business_id', bData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('appointments')
            .select('id, start_time, customer_name, customer_phone, status, total_amount, services(name), staff(name)')
            .eq('business_id', bData.id)
            .gte('start_time', start.toISOString())
            .lte('start_time', end.toISOString())
            .order('start_time', { ascending: true }) as any,
        ]);

        setServices(
          (sData || []).map((s) => ({
            id: s.id,
            name: s.name,
            price: Number(s.price) || 0,
            duration: s.duration_minutes || 30,
          }))
        );
        setStaffList((stData || []).map((s) => ({ id: s.id, name: s.name })));
        setAppointments(
          ((aptRes?.data as any[]) || []).map((a) => ({
            id: a.id,
            startTime: a.start_time,
            time: formatTime(a.start_time),
            customerName: a.customer_name || 'Misafir',
            customerPhone: a.customer_phone || '',
            service: a.services?.name || 'Hizmet',
            staff: a.staff?.name || null,
            price: Number(a.total_amount) || 0,
            status: (a.status as AptStatus) || 'pending',
          }))
        );
      } catch (err) {
        console.warn('Panel verileri yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Metrikler
  const metrics = useMemo(() => {
    const active = appointments.filter((a) => a.status !== 'canceled' && a.status !== 'no_show');
    return {
      total: active.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      expected: active.reduce((sum, a) => sum + a.price, 0),
      collected: appointments.filter((a) => a.status === 'completed').reduce((sum, a) => sum + a.price, 0),
    };
  }, [appointments]);

  const filteredAppointments = useMemo(
    () => (statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter)),
    [appointments, statusFilter]
  );

  // Durum güncelleme (iyimser + sunucu)
  const handleUpdateStatus = async (id: string, status: AptStatus) => {
    const previous = appointments;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const res = await updateAppointmentStatus(id, status);
    if (res && 'success' in res && !res.success) {
      setAppointments(previous);
      toast.error('Randevu güncellenemedi', { description: (res as any).error });
      return;
    }
    toast.success(`Randevu "${STATUS_META[status].label}" olarak işaretlendi`);
  };

  const handleCreated = (apt: AppointmentItem) => {
    const isToday = toLocalDateInput(new Date(apt.startTime)) === toLocalDateInput(new Date());
    if (isToday) {
      setAppointments((prev) => [...prev, apt].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  // ---------- Yükleniyor ----------
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-surface-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // ---------- İşletme yok ----------
  if (!business) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-200 text-surface-400">
          <Store className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-surface-900">Henüz işletme kaydınız yok</h1>
        <p className="mt-2 text-sm text-surface-400">
          Randevu almaya başlamak için işletmenizi birkaç adımda kaydedin.
        </p>
        <Link
          href="/isyeri-kayit"
          className="mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          İşletme Kaydı Oluştur
        </Link>
      </div>
    );
  }

  const setupSteps = [
    { done: services.length > 0, label: 'Hizmet ekleyin', href: '/dashboard/hizmetler' },
    { done: staffList.length > 0, label: 'Personel ekleyin', href: '/dashboard/personel' },
    { done: business.approvalStatus === 'approved', label: 'Onay sürecini tamamlayın', href: '/dashboard/ayarlar' },
  ];
  const setupComplete = setupSteps.every((s) => s.done);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm capitalize text-surface-400">{todayLabel}</p>
          <h1
            className="mt-1 truncate text-2xl font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {business.name}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/${business.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-surface-200 px-3.5 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-200/60 hover:text-surface-900"
          >
            <ExternalLink className="h-4 w-4" />
            Sayfam
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            Yeni Randevu
          </button>
        </div>
      </header>

      {/* Onay uyarısı */}
      {business.approvalStatus !== 'approved' && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-sm text-surface-500">
              {business.approvalStatus === 'rejected'
                ? 'İşletme başvurunuz onaylanmadı. Bilgilerinizi güncelleyip tekrar deneyebilirsiniz.'
                : 'İşletmeniz onay sürecinde. Bu sırada hizmet ve personel bilgilerinizi tamamlayabilirsiniz.'}
            </p>
          </div>
          <Link
            href="/dashboard/ayarlar"
            className="shrink-0 whitespace-nowrap text-sm font-medium text-amber-300 hover:text-amber-200"
          >
            Bilgileri düzenle →
          </Link>
        </div>
      )}

      {/* Metrikler */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Bugünkü randevu" value={String(metrics.total)} hint={`${metrics.completed} tamamlandı`} />
        <StatCard icon={Clock} label="Onay bekleyen" value={String(metrics.pending)} hint="Yanıt bekliyor" />
        <StatCard icon={Wallet} label="Beklenen ciro" value={formatTL(metrics.expected)} hint={`${formatTL(metrics.collected)} tahsil edildi`} />
        <StatCard icon={Users} label="Aktif personel" value={String(staffList.length)} hint={`${services.length} hizmet`} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bugünkü randevular */}
        <section className="overflow-hidden rounded-xl border border-surface-200 bg-surface-100 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-surface-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-surface-900">Bugünkü randevular</h2>
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={cn(
                    'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    statusFilter === f.key
                      ? 'bg-surface-200 text-surface-900'
                      : 'text-surface-400 hover:text-surface-700'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-surface-300" />
              <p className="mt-3 text-sm font-medium text-surface-600">
                {appointments.length === 0 ? 'Bugün için randevu yok' : 'Bu filtrede randevu yok'}
              </p>
              {appointments.length === 0 && (
                <p className="mt-1 text-xs text-surface-400">
                  Müşterileriniz sayfanızdan randevu aldığında burada görünecek.
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-surface-200">
              {filteredAppointments.map((apt) => (
                <li key={apt.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-surface-900">{apt.time}</span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium text-surface-900',
                        apt.status === 'canceled' && 'text-surface-400 line-through'
                      )}
                    >
                      {apt.customerName}
                    </p>
                    <p className="truncate text-xs text-surface-400">
                      {apt.service}
                      {apt.staff ? ` · ${apt.staff}` : ''}
                      {apt.price ? ` · ${formatTL(apt.price)}` : ''}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'hidden shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium sm:inline-block',
                      STATUS_META[apt.status].className
                    )}
                  >
                    {STATUS_META[apt.status].label}
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {apt.status === 'pending' && (
                      <IconAction title="Onayla" onClick={() => handleUpdateStatus(apt.id, 'confirmed')}>
                        <Check className="h-4 w-4" />
                      </IconAction>
                    )}
                    {apt.status === 'confirmed' && (
                      <IconAction title="Tamamlandı olarak işaretle" onClick={() => handleUpdateStatus(apt.id, 'completed')}>
                        <CheckCheck className="h-4 w-4" />
                      </IconAction>
                    )}
                    {apt.customerPhone && (
                      <a
                        href={whatsappLink(apt.customerPhone)}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp ile yaz"
                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-900"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <IconAction title="İptal et" danger onClick={() => handleUpdateStatus(apt.id, 'canceled')}>
                        <X className="h-4 w-4" />
                      </IconAction>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/dashboard/randevular"
            className="flex items-center justify-center gap-1 border-t border-surface-200 px-4 py-2.5 text-xs font-medium text-surface-400 transition-colors hover:text-surface-900"
          >
            Tüm randevuları gör
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Yan sütun */}
        <aside className="space-y-6">
          {!setupComplete && (
            <section className="rounded-xl border border-surface-200 bg-surface-100 p-4">
              <h2 className="text-sm font-semibold text-surface-900">Kurulum</h2>
              <p className="mt-1 text-xs text-surface-400">
                {setupSteps.filter((s) => s.done).length} / {setupSteps.length} adım tamamlandı
              </p>
              <ul className="mt-3 space-y-1">
                {setupSteps.map((step) => (
                  <li key={step.label}>
                    <Link
                      href={step.href}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-200/60"
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-surface-300" />
                      )}
                      <span className={cn('flex-1', step.done ? 'text-surface-400 line-through' : 'text-surface-700')}>
                        {step.label}
                      </span>
                      {!step.done && <ChevronRight className="h-4 w-4 text-surface-400" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-surface-200 bg-surface-100 p-2">
            <h2 className="px-2 pb-1 pt-2 text-sm font-semibold text-surface-900">Hızlı erişim</h2>
            <QuickLink href="/dashboard/hizmetler" icon={Scissors} label="Hizmetler" />
            <QuickLink href="/dashboard/personel" icon={Users} label="Personel" />
            <QuickLink href="/dashboard/qr-kod" icon={QrCode} label="QR masa kartı" />
            <QuickLink href={`/${business.slug}/tv`} icon={Tv} label="Sıra ekranı (TV)" external />
            <QuickLink href="/dashboard/ayarlar" icon={Settings} label="İşletme ayarları" />
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddAppointmentModal
            businessId={business.id}
            services={services}
            staffList={staffList}
            onClose={() => setShowAddModal(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// Alt Bileşenler
// ==========================================

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-surface-400">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-surface-400" />
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums text-surface-900">{value}</p>
      <p className="mt-1 truncate text-xs text-surface-400">{hint}</p>
    </div>
  );
}

function IconAction({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'rounded-md p-1.5 text-surface-400 transition-colors',
        danger ? 'hover:bg-rose-500/10 hover:text-rose-300' : 'hover:bg-surface-200 hover:text-surface-900'
      )}
    >
      {children}
    </button>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-200/60 hover:text-surface-900"
    >
      <Icon className="h-4 w-4 shrink-0 text-surface-400" />
      <span className="flex-1 truncate">{label}</span>
      {external ? (
        <ExternalLink className="h-3.5 w-3.5 text-surface-400" />
      ) : (
        <ChevronRight className="h-4 w-4 text-surface-400" />
      )}
    </Link>
  );
}

function AddAppointmentModal({
  businessId,
  services,
  staffList,
  onClose,
  onCreated,
}: {
  businessId: string;
  services: ServiceOption[];
  staffList: StaffOption[];
  onClose: () => void;
  onCreated: (apt: AppointmentItem) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceId: services[0]?.id || '',
    staffId: '',
    date: toLocalDateInput(new Date()),
    time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    'w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 outline-none transition-colors focus:border-primary-400';
  const labelClass = 'mb-1.5 block text-xs font-medium text-surface-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === form.serviceId);
    if (!service) return toast.error('Lütfen bir hizmet seçin.');
    if (!form.name.trim() || !form.phone.trim() || !form.time) {
      return toast.error('Müşteri adı, telefon ve saat zorunludur.');
    }

    const start = new Date(`${form.date}T${form.time}`);
    const end = new Date(start.getTime() + service.duration * 60000);

    setSubmitting(true);
    const res = await createAppointment({
      businessId,
      serviceId: service.id,
      staffId: form.staffId || null,
      customerName: form.name.trim(),
      customerPhone: form.phone.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      totalAmount: service.price,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error('Randevu kaydedilemedi', { description: res.error });
      return;
    }

    const created = res.data as any;
    onCreated({
      id: created?.id || String(Date.now()),
      startTime: start.toISOString(),
      time: formatTime(start.toISOString()),
      customerName: form.name.trim(),
      customerPhone: form.phone.trim(),
      service: service.name,
      staff: staffList.find((s) => s.id === form.staffId)?.name || null,
      price: service.price,
      status: (created?.status as AptStatus) || 'pending',
    });
    toast.success('Randevu kaydedildi');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-surface-200 bg-surface-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
          <h3 className="text-base font-semibold text-surface-900">Yeni randevu</h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-md p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {services.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-surface-500">Randevu oluşturmak için önce en az bir hizmet eklemelisiniz.</p>
            <Link
              href="/dashboard/hizmetler"
              className="mt-4 inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Hizmet Ekle
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Müşteri adı</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Telefon</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="05xx xxx xx xx"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Hizmet</label>
              <select
                className={inputClass}
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.duration} dk · {formatTL(s.price)}
                  </option>
                ))}
              </select>
            </div>

            {staffList.length > 0 && (
              <div>
                <label className={labelClass}>Personel</label>
                <select
                  className={inputClass}
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                >
                  <option value="">Fark etmez</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tarih</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  min={toLocalDateInput(new Date())}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Saat</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-surface-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="whitespace-nowrap rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200/60"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
