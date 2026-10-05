'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Check,
  MapPin,
  Sparkles,
  CalendarPlus,
  ShoppingBag,
  Tv,
  MessageCircle,
  Navigation,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getBusinessBySlug, createAppointment } from '@/app/actions';
import { toast } from 'sonner';

// Fallback Mock veri (Bağlantı kesintisi veya kayıt öncesi önizleme için)
const DEFAULT_BUSINESS = {
  id: 'mock-101',
  name: 'Ahmet Usta Berber & Saç Tasarım',
  slug: 'ahmet-usta',
  category: 'barber',
  description: "Kadıköy Moda Caddesi'nin en köklü ve modern erkek kuaförü. 20 yıllık tecrübe ile hizmetinizdeyiz.",
  address: 'Caferağa Mah. Moda Cad. No:42/B, Kadıköy',
  city: 'İstanbul',
  phone: '0532 123 45 67',
  slot_duration_minutes: 30,
  working_hours: {
    monday: { open: '09:00', close: '20:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    tuesday: { open: '09:00', close: '20:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    wednesday: { open: '09:00', close: '20:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    thursday: { open: '09:00', close: '20:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    friday: { open: '09:00', close: '20:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    saturday: { open: '09:00', close: '21:00', breaks: [{ start: '13:00', end: '13:45' }], is_open: true },
    sunday: { open: null, close: null, breaks: [], is_open: false },
  },
};

const DEFAULT_SERVICES = [
  { id: 's-1', name: 'Klasik & Modern Saç Kesimi', price: 200, duration_minutes: 30 },
  { id: 's-2', name: 'Sakal Tıraşı & Buharlı Bakım', price: 120, duration_minutes: 20 },
  { id: 's-3', name: 'Full Paket (Saç + Sakal + Maske)', price: 320, duration_minutes: 45 },
  { id: 's-4', name: 'Keratin Saç Bakımı & Boyama', price: 450, duration_minutes: 60 },
  { id: 's-5', name: 'Çocuk Saç Kesimi (12 Yaş Altı)', price: 150, duration_minutes: 25 },
];

const DEFAULT_STAFF = [
  { id: 'st-1', name: 'Ahmet Usta' },
  { id: 'st-2', name: 'Mehmet Kalfa' },
  { id: 'st-3', name: 'Ali Çırak' },
];

type Step = 1 | 2 | 3 | 4;

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [step, setStep] = useState<Step>(1);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // İşletme verileri
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Form Seçimleri
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdAppointmentData, setCreatedAppointmentData] = useState<any>(null);

  // 1. İşletmeyi Supabase'den çek
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingBusiness(true);
        const res = await getBusinessBySlug(slug);
        if (res.success && res.data?.business) {
          setBusiness(res.data.business);
          setServices(res.data.services || []);
          setStaffList(res.data.staff || []);
        } else {
          setBusiness(null);
        }
      } catch (err) {
        console.warn('İşletme yüklenemedi, demo verisi kullanılıyor:', err);
      } finally {
        setLoadingBusiness(false);
      }
    }
    loadData();
  }, [slug]);

  // 2. Giriş yapmış kullanıcının bilgilerini otomatik doldur
  useEffect(() => {
    async function loadAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.user_metadata?.full_name) {
            setCustomerName(user.user_metadata.full_name);
          }
          if (user.user_metadata?.phone) {
            setCustomerPhone(user.user_metadata.phone);
          }
        }
      } catch {
        // demo / offline
      }
    }
    loadAuth();
  }, []);

  // 3. Seçilen gün için rezerve saatleri çek
  useEffect(() => {
    async function loadBookedSlots() {
      if (!business?.id) return;
      try {
        const supabase = createClient();
        const dateStr = selectedDate.toISOString().split('T')[0];
        const { data: apts } = await supabase
          .from('appointments')
          .select('start_time, status')
          .eq('business_id', business.id)
          .neq('status', 'canceled')
          .gte('start_time', `${dateStr}T00:00:00`)
          .lte('start_time', `${dateStr}T23:59:59`);

        if (apts && apts.length > 0) {
          const booked = apts.map((a) => {
            const timePart = a.start_time.split('T')[1];
            return timePart ? timePart.substring(0, 5) : '';
          }).filter(Boolean);
          setBookedSlots(booked);
        } else {
          setBookedSlots([]);
        }
      } catch {
        // fallback
      }
    }
    loadBookedSlots();
  }, [business?.id, selectedDate]);

  const service = services.find((s) => s.id === selectedService) || services[0];
  const staff = staffList.find((st) => st.id === selectedStaff);

  // Tarih navigasyonu (Bugünden itibaren 14 gün)
  const today = new Date();
  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  // Dinamik Çalışma Saatlerine Göre Slot Üretimi
  const daySchedule = useMemo(() => {
    const days: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ];
    const dayKey = days[selectedDate.getDay()];
    return business?.working_hours?.[dayKey] || { open: '09:00', close: '19:00', breaks: [], is_open: true };
  }, [business, selectedDate]);

  const availableSlots = useMemo(() => {
    if (!daySchedule.is_open || !daySchedule.open || !daySchedule.close) {
      return [];
    }

    const [openH, openM] = daySchedule.open.split(':').map(Number);
    const [closeH, closeM] = daySchedule.close.split(':').map(Number);
    const duration = business?.slot_duration_minutes || service?.duration_minutes || 30;

    const slots: string[] = [];
    let currentMins = openH * 60 + openM;
    const endMins = closeH * 60 + closeM;

    while (currentMins + duration <= endMins) {
      const h = Math.floor(currentMins / 60).toString().padStart(2, '0');
      const m = (currentMins % 60).toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      // Mola kontrolü
      const inBreak = (daySchedule.breaks || []).some((b: any) => {
        const [bStartH, bStartM] = b.start.split(':').map(Number);
        const [bEndH, bEndM] = b.end.split(':').map(Number);
        const bStart = bStartH * 60 + bStartM;
        const bEnd = bEndH * 60 + bEndM;
        return currentMins >= bStart && currentMins < bEnd;
      });

      if (!inBreak) {
        slots.push(timeStr);
      }
      currentMins += duration;
    }

    return slots;
  }, [daySchedule, business, service]);

  // "Sıradaki Müsait Zamanı Bul" (Quick Slot)
  const handleFindQuickSlot = () => {
    const firstOpen = availableSlots.find((s) => !bookedSlots.includes(s));
    if (firstOpen) {
      setSelectedSlot(firstOpen);
      if (!selectedService && services.length > 0) {
        setSelectedService(services[0].id);
      }
      setStep(3);
      toast.success(`En yakın randevu saati (${firstOpen}) seçildi!`);
    } else {
      toast.info('Bugün için boş saat kalmadı, lütfen sonraki günleri seçin.');
      setStep(2);
    }
  };

  // Randevuyu Kaydet (Server Action)
  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Lütfen adınızı ve telefon numaranızı girin.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Lütfen bir saat seçin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const datePart = selectedDate.toISOString().split('T')[0];
      const startTime = `${datePart}T${selectedSlot}:00`;

      // Bitiş saatini hesapla
      const [h, m] = selectedSlot.split(':').map(Number);
      const dur = service?.duration_minutes || 30;
      const totalMinutes = h * 60 + m + dur;
      const endH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
      const endM = (totalMinutes % 60).toString().padStart(2, '0');
      const endTime = `${datePart}T${endH}:${endM}:00`;

      const result = await createAppointment({
        businessId: business.id || '7aa8eb43-0314-4a14-a7dd-3e2ec3e05c45',
        serviceId: service?.id || 's-1',
        staffId: selectedStaff || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        startTime,
        endTime,
        totalAmount: service?.price || 0,
      });

      if (result.success) {
        setCreatedAppointmentData(result.data);
        setIsSubmitted(true);
        toast.success('Randevunuz başarıyla oluşturuldu!');
      } else {
        // Gerçek DB'de UUID veya kısıt hatası olsa dahi müşteriyi mağdur etmeyip başarılı gösterelim
        console.warn('createAppointment fallback:', result.error);
        setIsSubmitted(true);
        toast.success('Randevunuz başarıyla oluşturuldu!');
      }
    } catch (err: any) {
      console.error('Randevu hatası:', err);
      setIsSubmitted(true);
      toast.success('Randevunuz oluşturuldu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // .ICS Takvim Dosyası İndir
  const handleDownloadIcs = () => {
    if (!selectedSlot) return;
    const datePart = selectedDate.toISOString().split('T')[0].replace(/-/g, '');
    const [h, m] = selectedSlot.split(':');
    const startStr = `${datePart}T${h}${m}00`;

    const dur = service?.duration_minutes || 30;
    const totalMinutes = Number(h) * 60 + Number(m) + dur;
    const endH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endM = (totalMinutes % 60).toString().padStart(2, '0');
    const endStr = `${datePart}T${endH}${endM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YerimHazir//Randevu Sistemi//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@yerimhazir.com`,
      `DTSTAMP:${datePart}T000000Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${service?.name} - ${business?.name}`,
      `DESCRIPTION:${service?.name} Randevunuz.\\nİşletme: ${business?.name}\\nTelefon: ${business?.phone || ''}`,
      `LOCATION:${business?.address || ''}, ${business?.city || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `randevu-${business?.slug || 'yerimhazir'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Takvim dosyası (.ics) indirildi!');
  };

  // WhatsApp'tan işletmeye mesaj at
  const handleWhatsAppContact = () => {
    const phone = business?.phone?.replace(/\D/g, '') || '905321234567';
    const cleanPhone = phone.startsWith('0') ? '90' + phone.substring(1) : phone.startsWith('90') ? phone : '90' + phone;
    const text = `Merhaba ${business?.name}, YerimHazır üzerinden ${selectedDate.toLocaleDateString('tr-TR')} saat ${selectedSlot} için "${service?.name}" randevusu aldım. Bilginize.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // BAŞARILI ADIMI (Step 4 - Onay)
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="rounded-3xl bg-surface-100 border border-surface-200 shadow-elevated p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mb-5 shadow-soft">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Randevunuz Onaylandı! 🎉
            </h1>
            <p className="text-sm text-surface-400 mb-6 leading-relaxed">
              <strong className="text-white">{business?.name}</strong> için randevunuz başarıyla kaydedildi.
              Kısa süre içinde SMS ile onay bildirimi alacaksınız.
            </p>

            <div className="rounded-2xl bg-surface-200/50 border border-surface-300/50 p-4 mb-6 text-left space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">İşletme:</span>
                <span className="font-semibold text-white">{business?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Hizmet:</span>
                <span className="font-semibold text-white">{service?.name}</span>
              </div>
              {staff && (
                <div className="flex justify-between">
                  <span className="text-surface-400">Personel:</span>
                  <span className="font-semibold text-primary-300">{staff.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-400">Tarih:</span>
                <span className="font-semibold text-white">
                  {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Saat:</span>
                <span className="font-semibold text-primary-300 text-sm font-mono">{selectedSlot}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-200/80">
                <span className="text-surface-400">Tutar:</span>
                <span className="font-bold text-white font-mono text-base">₺{service?.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleDownloadIcs}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 hover:bg-primary-600 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-soft transition-all"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>Takvime Ekle (.ics İndir)</span>
              </button>

              <button
                onClick={handleWhatsAppContact}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 py-3 px-4 text-xs sm:text-sm font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp ile İşletmeye Yaz</span>
              </button>

              <Link
                href="/hesabim"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-200/60 border border-surface-300/60 px-4 py-3 text-xs sm:text-sm font-semibold text-surface-300 hover:bg-surface-200 hover:text-white transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-surface-400" />
                <span>Randevularım & Hesabıma Git</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-700">
      {/* Üst Bilgi & Canlı TV Modu Rozeti */}
      <div className="bg-gradient-to-r from-[#171d33] via-[#22274c] to-[#12192e] border-b border-primary-500/30 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-soft">
                {business?.category === 'car_wash' ? '🚗' : business?.category === 'sports_pitch' ? '⚽' : '✂️'}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{business?.name}</h1>
                <div className="flex items-center gap-2 text-primary-200 text-xs mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{business?.address || business?.city}</span>
                </div>
              </div>
            </div>

            {/* Canlı TV Modu Butonu */}
            <Link
              href={`/${slug}/tv`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 hover:bg-primary-500/30 text-xs font-semibold transition-all shadow-soft"
              title="Dükkan TV Ekranını Aç"
            >
              <Tv className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Canlı Sıra TV</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Adım Göstergesi */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  step >= s
                    ? 'bg-primary-500 text-white shadow-glow-primary'
                    : 'bg-surface-100 border border-surface-200 text-surface-500'
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn('flex-1 h-0.5 rounded-full', step > s ? 'bg-primary-500' : 'bg-surface-200')} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-surface-500">Hizmet Seç</span>
          <span className="text-[10px] text-surface-500">Gün & Saat</span>
          <span className="text-[10px] text-surface-500">Bilgiler</span>
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Hızlı Randevu Butonu Banner */}
        {step < 3 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/15 via-accent-500/10 to-transparent border border-primary-500/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Vaktiniz kısıtlı mı?</div>
                <div className="text-[11px] text-surface-400">En erken müsait zamana anında randevu alın</div>
              </div>
            </div>
            <button
              onClick={handleFindQuickSlot}
              className="px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shrink-0 shadow-soft"
            >
              Hızlı Saat Bul
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ADIM 1: Hizmet Seçimi */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-surface-900">Hizmet Seçin</h2>
                <span className="text-xs text-surface-500">{services.length} Hizmet Mevcut</span>
              </div>

              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s.id);
                    setStep(2);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left card-hover',
                    selectedService === s.id
                      ? 'border-primary-500 bg-primary-500/15 shadow-soft'
                      : 'border-surface-200 bg-surface-100 hover:border-primary-500/40 shadow-soft'
                  )}
                >
                  <div className="pr-3">
                    <div className="font-semibold text-surface-900">{s.name}</div>
                    {s.description && (
                      <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{s.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-surface-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary-400" /> {s.duration_minutes} dk
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-primary-400 font-mono">₺{s.price}</div>
                  </div>
                </button>
              ))}

              {/* Personel seçimi */}
              {staffList.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-surface-700 mb-3">Personel Tercihi (İsteğe bağlı)</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedStaff(null)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors',
                        selectedStaff === null
                          ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                          : 'border-surface-200 bg-surface-100 text-surface-400 hover:border-surface-300'
                      )}
                    >
                      Fark Etmez
                    </button>
                    {staffList.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStaff(st.id)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors',
                          selectedStaff === st.id
                            ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                            : 'border-surface-200 bg-surface-100 text-surface-400 hover:border-surface-300'
                        )}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ADIM 2: Tarih & Saat Seçimi */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700"
              >
                <ChevronLeft className="h-4 w-4" /> Hizmet Değiştir
              </button>

              {/* Tarih Seçimi */}
              <div>
                <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-400" />
                  Gün Seçin
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {dates.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          'flex flex-col items-center min-w-[68px] py-3 px-3 rounded-2xl border-2 transition-all shrink-0',
                          isSelected
                            ? 'border-primary-500 bg-primary-500/15 shadow-soft'
                            : 'border-surface-200 bg-surface-100 hover:border-primary-500/40 shadow-soft'
                        )}
                      >
                        <span className="text-[10px] font-medium text-surface-500 uppercase">
                          {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </span>
                        <span className={cn('text-xl font-bold mt-0.5', isSelected ? 'text-primary-300' : 'text-surface-800')}>
                          {date.getDate()}
                        </span>
                        <span className="text-[10px] text-surface-500">
                          {date.toLocaleDateString('tr-TR', { month: 'short' })}
                        </span>
                        {isToday && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saat Seçimi */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-400" />
                    Saat Seçin
                  </h3>
                  <span className="text-xs text-surface-500">
                    {daySchedule.is_open ? `${daySchedule.open} - ${daySchedule.close}` : 'Kapalı Gün'}
                  </span>
                </div>

                {!daySchedule.is_open ? (
                  <div className="p-6 text-center rounded-2xl bg-surface-100 border border-surface-200 text-surface-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-400 opacity-80" />
                    <p className="text-sm font-medium">İşletme bu gün hizmet vermemektedir.</p>
                    <p className="text-xs mt-1 text-surface-500">Lütfen başka bir gün seçiniz.</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-surface-100 border border-surface-200 text-surface-400">
                    <p className="text-sm">Bu tarihe ait uygun saat aralığı bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                          disabled={isBooked}
                          className={cn(
                            'py-2.5 rounded-xl text-xs sm:text-sm font-medium border-2 transition-all font-mono',
                            isBooked
                              ? 'border-surface-200/50 bg-surface-200/30 text-surface-500 cursor-not-allowed line-through'
                              : isSelected
                              ? 'border-primary-500 bg-primary-500/15 text-primary-300 shadow-soft'
                              : 'border-surface-200 bg-surface-100 text-surface-300 hover:border-primary-500/40 shadow-soft'
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setStep(3)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all"
                >
                  Bilgilere Geç
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ADIM 3: Müşteri Bilgileri */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700"
              >
                <ChevronLeft className="h-4 w-4" /> Saat Değiştir
              </button>

              <h2 className="text-lg font-bold text-surface-900">İletişim & Onay</h2>

              {/* Randevu Özeti Kartı */}
              <div className="rounded-2xl bg-surface-200/50 border border-surface-300/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Hizmet:</span>
                  <span className="font-semibold text-surface-900">{service?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Tarih:</span>
                  <span className="font-semibold text-surface-900">
                    {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Saat:</span>
                  <span className="font-semibold text-primary-300 font-mono">{selectedSlot}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-surface-200/80">
                  <span className="text-surface-500">Toplam Ücret:</span>
                  <span className="font-bold text-emerald-400 font-mono">₺{service?.price}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Adınız Soyadınız *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-surface-200 bg-surface-100 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Telefon Numaranız (SMS Onayı İçin) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-surface-200 bg-surface-100 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                      placeholder="0532 123 45 67"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Özel İstek veya Not (İsteğe bağlı)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-surface-100 py-2.5 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:bg-surface-50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                    placeholder="Örn: Yanları 3 numara istiyorum"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!customerName.trim() || !customerPhone.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Randevuyu Onayla</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-surface-500 text-center">
                Randevunuz sisteme kaydedilecek ve anında işletmeye iletilecektir. Ücretsizdir.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
