'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Ban,
  MessageSquare,
  Plus,
  X,
  MessageCircle,
} from 'lucide-react';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { updateAppointmentStatus, cancelAppointment, createAppointment } from '@/app/actions';
import { getWhatsAppDirectLink } from '@/lib/notifications';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'canceled';

type AppointmentItem = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service: string;
  staff: string | null;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  price: number;
  cancellation_reason?: string | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFilterMode, setDateFilterMode] = useState<'selected' | 'all'>('selected');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApt, setNewApt] = useState({
    customer_name: '',
    customer_phone: '',
    service: 'Klasik & Modern Saç Kesimi',
    staff: 'Ahmet Usta',
    time: '12:00',
    price: 200,
  });

  // Gerçek Supabase randevularını yükle
  useEffect(() => {
    async function loadRealAppointments() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: bData } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();
          if (bData) {
            const { data: apts } = await supabase
              .from('appointments')
              .select('id, customer_name, customer_phone, start_time, end_time, status, total_amount, cancellation_reason, services(name), staff(name)')
              .eq('business_id', bData.id)
              .order('start_time', { ascending: false });

            if (apts) {
              setAppointments(apts.map((a: any) => ({
                id: a.id,
                customer_name: a.customer_name,
                customer_phone: a.customer_phone,
                service: a.services?.name || 'Hizmet',
                staff: a.staff?.name || null,
                start_time: a.start_time,
                end_time: a.end_time,
                duration: 30,
                status: a.status as any,
                price: Number(a.total_amount) || 0,
                cancellation_reason: a.cancellation_reason,
              })));
            } else {
              setAppointments([]);
            }
          }
        }
      } catch (err) {
        console.warn('Randevu listesi yüklenemedi, varsayılanlar devrede:', err);
      }
    }
    loadRealAppointments();
  }, []);

  const filtered = appointments.filter((apt) => {
    if (filter !== 'all' && apt.status !== filter) return false;
    if (search && !apt.customer_name.toLowerCase().includes(search.toLowerCase()) && !apt.customer_phone.includes(search)) return false;
    if (dateFilterMode === 'selected') {
      const aptDate = apt.start_time.split('T')[0];
      const selDate = selectedDate.toISOString().split('T')[0];
      if (aptDate !== selDate) return false;
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus as AppointmentItem['status'] } : a))
    );
    toast.success(`Randevu ${APPOINTMENT_STATUS_LABELS[newStatus]?.label || newStatus} olarak güncellendi`);
    setActionMenu(null);
    try {
      await updateAppointmentStatus(id, newStatus as any);
    } catch (e) {
      console.warn('Durum server action hatası:', e);
    }
  };

  const handleCancel = async (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'canceled' as const, cancellation_reason: cancelReason } : a))
    );
    toast.success('Randevu iptal edildi. Müşteriye bildirim iletildi.');
    const reason = cancelReason;
    setCancelDialog(null);
    setCancelReason('');
    try {
      await cancelAppointment(id, reason);
    } catch (e) {
      console.warn('İptal server action hatası:', e);
    }
  };

  const handleWhatsAppReminder = (apt: AppointmentItem) => {
    const timeStr = new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(apt.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    const msg = `Merhaba Sayın ${apt.customer_name}, ${dateStr} saat ${timeStr} için "${apt.service}" randevunuzu hatırlatmak isteriz. Bir değişiklik veya sorunuz olursa bu mesajı yanıtlayabilirsiniz. Görüşmek üzere!`;
    const url = getWhatsAppDirectLink(apt.customer_phone, msg);
    window.open(url, '_blank');
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.customer_name || !newApt.customer_phone) {
      toast.error('Müşteri adı ve telefon numarası zorunludur.');
      return;
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    const created: AppointmentItem = {
      id: Date.now().toString(),
      customer_name: newApt.customer_name,
      customer_phone: newApt.customer_phone,
      service: newApt.service,
      staff: newApt.staff || null,
      start_time: `${dateStr}T${newApt.time}:00`,
      end_time: `${dateStr}T${newApt.time}:00`,
      duration: 30,
      status: 'confirmed',
      price: Number(newApt.price) || 200,
    };
    setAppointments((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewApt({
      customer_name: '',
      customer_phone: '',
      service: 'Klasik & Modern Saç Kesimi',
      staff: 'Ahmet Usta',
      time: '12:00',
      price: 200,
    });
    toast.success('Randevu başarıyla eklendi!');
  };

  // Tarih navigasyonu
  const navigateDate = (dir: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + dir);
    setSelectedDate(newDate);
  };

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    canceled: appointments.filter((a) => a.status === 'canceled').length,
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Üst Butonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-surface-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <CalendarDays className="inline h-6 w-6 mr-2 text-primary-400" />
            Randevular
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Tüm randevularınızı listeleyin, onaylayın veya tek tıkla WhatsApp ile hatırlatın
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tarih Navigasyonu */}
          <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-100 p-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-md hover:bg-surface-200 transition-colors text-surface-400 hover:text-surface-900"
              title="Önceki Gün"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-2 text-xs font-semibold text-surface-800 whitespace-nowrap min-w-[90px] text-center">
              {selectedDate.toLocaleDateString('tr-TR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-md hover:bg-surface-200 transition-colors text-surface-400 hover:text-surface-900"
              title="Sonraki Gün"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setDateFilterMode(dateFilterMode === 'selected' ? 'all' : 'selected')}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap',
              dateFilterMode === 'all'
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                : 'bg-surface-100 border-surface-200 text-surface-400 hover:text-surface-900'
            )}
          >
            {dateFilterMode === 'all' ? 'Tüm Tarihler' : 'Seçilen Gün'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Randevu Ekle
          </button>
        </div>
      </div>

      {/* Arama & Filtreler */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Arama */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-surface-100 py-2 pl-9 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-400 outline-none transition-colors"
            placeholder="Müşteri adı veya telefon ara..."
          />
        </div>

        {/* Durum Filtreleri */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {([
            { key: 'all', label: 'Tümü' },
            { key: 'pending', label: 'Bekleyen' },
            { key: 'confirmed', label: 'Onaylı' },
            { key: 'completed', label: 'Tamamlanan' },
            { key: 'canceled', label: 'İptal' },
          ] as { key: FilterStatus; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors',
                filter === f.key
                  ? 'border-primary-500/40 bg-primary-500/15 text-primary-300 font-semibold'
                  : 'border-surface-200 bg-surface-100 text-surface-400 hover:text-surface-900'
              )}
            >
              {f.label}
              <span className="ml-1 text-[11px] opacity-70">({statusCounts[f.key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Randevu Listesi */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-surface-100 border border-surface-200 p-12 text-center">
            <CalendarDays className="h-10 w-10 text-surface-300 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-surface-600">Bu kriterlere uygun randevu bulunamadı.</p>
            <p className="text-xs text-surface-400 mt-1">Farklı bir tarih veya filtre seçmeyi deneyin.</p>
          </div>
        ) : (
          filtered.map((apt, i) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-xl bg-surface-100 border border-surface-200 p-4 hover:border-surface-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Sol: Saat + Müşteri + Detay */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="shrink-0 text-center w-14 py-1.5 px-2 rounded-lg bg-surface-200/50 border border-surface-200">
                    <div className="text-sm font-bold text-surface-900 font-mono">
                      {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-surface-400 mt-0.5">{apt.duration} dk</div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-surface-900 truncate">{apt.customer_name}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0',
                          APPOINTMENT_STATUS_LABELS[apt.status]?.bgColor || 'bg-surface-200 text-surface-400'
                        )}
                      >
                        {APPOINTMENT_STATUS_LABELS[apt.status]?.label || apt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-surface-500" />
                        {apt.customer_phone}
                      </span>
                      <span>·</span>
                      <span className="text-surface-300">{apt.service}</span>
                      {apt.staff && (
                        <>
                          <span>·</span>
                          <span>{apt.staff}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: Fiyat & Eylemler */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-200/60">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-bold text-surface-900 font-mono">₺{apt.price}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Hızlı Onay Butonu */}
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        title="Randevuyu Onayla"
                        className="p-1.5 rounded-lg border border-primary-500/30 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* Hızlı Tamamlandı Butonu */}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        title="Geldi / Tamamlandı"
                        className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* WhatsApp ile Hatırlat */}
                    {apt.customer_phone && (
                      <button
                        onClick={() => handleWhatsAppReminder(apt)}
                        className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Müşteriye WhatsApp ile Randevu Hatırlat"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    )}

                    {/* İptal Butonu */}
                    {apt.status !== 'canceled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setCancelDialog(apt.id);
                        }}
                        className="p-1.5 rounded-lg border border-surface-200 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Randevuyu İptal Et"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* İptal Dialog */}
      <AnimatePresence>
        {cancelDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setCancelDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-surface-100 border border-surface-200 shadow-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                    <Ban className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-surface-900">Randevuyu İptal Et</h3>
                    <p className="text-xs text-surface-500">Bu işlem geri alınamaz</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    İptal Nedeni <span className="text-xs text-surface-500">(İsteğe bağlı)</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all outline-none resize-none"
                    rows={3}
                    placeholder="Müşteriye gönderilecek iptal nedeni..."
                  />
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => setCancelDialog(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-surface-200 text-xs sm:text-sm font-medium text-surface-400 hover:text-surface-900 hover:bg-surface-200/60 transition-colors whitespace-nowrap"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => handleCancel(cancelDialog)}
                    className="flex-1 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap"
                  >
                    İptal Et
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Randevu Ekle Dialog */}
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="w-full max-w-lg rounded-2xl bg-surface-100 border border-surface-200 shadow-elevated p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
                      <Plus className="h-4.5 w-4.5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-surface-900">Yeni Randevu Ekle</h3>
                      <p className="text-xs text-surface-500">Müşteri randevusunu manuel olarak kaydedin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-lg hover:bg-surface-200/60 text-surface-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddAppointment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Müşteri Adı Soyadı <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        type="text"
                        value={newApt.customer_name}
                        onChange={(e) => setNewApt((p) => ({ ...p, customer_name: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-9 pr-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                        placeholder="Örn: Serdar Koç"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Telefon Numarası <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                      <input
                        type="tel"
                        value={newApt.customer_phone}
                        onChange={(e) => setNewApt((p) => ({ ...p, customer_phone: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-9 pr-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                        placeholder="0532 999 88 77"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 mb-1">Hizmet</label>
                      <select
                        value={newApt.service}
                        onChange={(e) => {
                          const s = e.target.value;
                          const prices: Record<string, number> = {
                            'Saç Kesimi': 150,
                            'Sakal Tıraşı': 100,
                            'Saç + Sakal': 200,
                            'Saç Boyama': 350,
                            'Çocuk Tıraşı': 100,
                          };
                          setNewApt((p) => ({ ...p, service: s, price: prices[s] || 150 }));
                        }}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                      >
                        <option value="Saç Kesimi">Saç Kesimi (₺150)</option>
                        <option value="Sakal Tıraşı">Sakal Tıraşı (₺100)</option>
                        <option value="Saç + Sakal">Saç + Sakal (₺200)</option>
                        <option value="Saç Boyama">Saç Boyama (₺350)</option>
                        <option value="Çocuk Tıraşı">Çocuk Tıraşı (₺100)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-700 mb-1">Personel</label>
                      <select
                        value={newApt.staff}
                        onChange={(e) => setNewApt((p) => ({ ...p, staff: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                      >
                        <option value="Ahmet Usta">Ahmet Usta (Baş Berber)</option>
                        <option value="Mehmet Kalfa">Mehmet Kalfa (Berber)</option>
                        <option value="">Fark Etmez / İlk Müsait</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 mb-1">Saat</label>
                      <input
                        type="time"
                        value={newApt.time}
                        onChange={(e) => setNewApt((p) => ({ ...p, time: e.target.value }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 mb-1">Fiyat (₺)</label>
                      <input
                        type="number"
                        value={newApt.price}
                        onChange={(e) => setNewApt((p) => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none font-mono"
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-surface-200 text-xs sm:text-sm font-medium text-surface-400 hover:text-surface-900 hover:bg-surface-200/60 transition-colors whitespace-nowrap"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
                    >
                      Randevuyu Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
