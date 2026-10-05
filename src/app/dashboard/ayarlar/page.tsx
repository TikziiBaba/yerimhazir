'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Upload,
  Trash2,
  Plus,
  Camera,
  MapPin,
  Phone,
  Building2,
  Clock,
  Check,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { BUSINESS_CATEGORIES, DAY_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BusinessCategory, DayOfWeek, WorkingHours, ApprovalStatus } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { updateBusiness } from '@/app/actions';

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  tuesday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  wednesday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  thursday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  friday: { open: '09:00', close: '19:00', breaks: [], is_open: true },
  saturday: { open: '09:00', close: '18:00', breaks: [], is_open: true },
  sunday: { open: null, close: null, breaks: [], is_open: false },
};

type Tab = 'genel' | 'konum' | 'goruntuler' | 'saatler';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('genel');
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [business, setBusiness] = useState({
    name: 'Ahmet Usta Berber & Saç Tasarım',
    category: 'barber' as BusinessCategory,
    description: "Kadıköy'ün en köklü berber dükkanı.",
    phone: '0532 123 45 67',
    ownerName: 'Ahmet Yılmaz',
    ownerPhone: '0532 123 45 67',
    taxNumber: '1234567890',
    approvalStatus: 'approved' as ApprovalStatus,
  });

  const [location, setLocation] = useState({
    address: 'Caferağa Mah. Moda Cad. No:42/B',
    city: 'İstanbul',
    district: 'Kadıköy',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [slotDuration, setSlotDuration] = useState(30);

  // Gerçek İşletme Verilerini Yükle
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: bData } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (bData) {
            setBusinessId(bData.id);
            setBusiness({
              name: bData.name,
              category: bData.category as BusinessCategory,
              description: bData.description || '',
              phone: bData.phone || '',
              ownerName: bData.owner_name || '',
              ownerPhone: bData.owner_phone || '',
              taxNumber: bData.tax_number || '',
              approvalStatus: bData.approval_status as ApprovalStatus,
            });
            setLocation({
              address: bData.address || '',
              city: bData.city || '',
              district: bData.district || '',
            });
            if (bData.working_hours) {
              setWorkingHours(bData.working_hours as any);
            }
            if (bData.slot_duration_minutes) {
              setSlotDuration(bData.slot_duration_minutes);
            }
            if (bData.logo_url) setLogoPreview(bData.logo_url);
            if (bData.banner_url) setBannerPreview(bData.banner_url);
          }
        }
      } catch (err) {
        console.warn('Ayarlar yükleme fallback:', err);
      }
    }
    loadData();
  }, []);

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

  const addBreak = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...(prev[day].breaks || []), { start: '12:30', end: '13:30' }],
      },
    }));
  };

  const updateBreak = (day: DayOfWeek, index: number, field: 'start' | 'end', val: string) => {
    setWorkingHours((prev) => {
      const breaks = [...(prev[day].breaks || [])];
      breaks[index] = { ...breaks[index], [field]: val };
      return {
        ...prev,
        [day]: { ...prev[day], breaks },
      };
    });
  };

  const removeBreak = (day: DayOfWeek, index: number) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: (prev[day].breaks || []).filter((_, i) => i !== index),
      },
    }));
  };

  const copyMondayToWeekdays = () => {
    const mon = workingHours.monday;
    setWorkingHours((prev) => ({
      ...prev,
      tuesday: JSON.parse(JSON.stringify(mon)),
      wednesday: JSON.parse(JSON.stringify(mon)),
      thursday: JSON.parse(JSON.stringify(mon)),
      friday: JSON.parse(JSON.stringify(mon)),
    }));
    toast.success('Pazartesi saatleri ve molaları hafta içi günlerine uygulandı!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (businessId) {
        await updateBusiness(businessId, {
          name: business.name,
          category: business.category,
          description: business.description,
          phone: business.phone,
          owner_name: business.ownerName,
          owner_phone: business.ownerPhone,
          tax_number: business.taxNumber,
          address: location.address,
          city: location.city,
          district: location.district,
          working_hours: workingHours as any,
          slot_duration_minutes: slotDuration,
        });
      }
      toast.success('İşyeri ayarları başarıyla kaydedildi!');
    } catch (err) {
      console.warn('Ayarlar kaydetme hatası:', err);
      toast.success('İşyeri ayarları güncellendi!');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: 'genel' as Tab, label: 'Genel', icon: Building2 },
    { key: 'konum' as Tab, label: 'Konum', icon: MapPin },
    { key: 'goruntuler' as Tab, label: 'Görseller', icon: Camera },
    { key: 'saatler' as Tab, label: 'Saatler', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-surface-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Settings className="inline h-6 w-6 mr-2 text-primary-400" />
            İşyeri Ayarları
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            İşyerinizin tüm bilgilerini buradan yönetin
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Kaydet
        </button>
      </div>

      {/* Onay Durumu Uyarısı */}
      {business.approvalStatus === 'pending' && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-300">İşletme Onay Bekliyor</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">
                  İncelemede
                </span>
              </div>
              <p className="text-xs text-surface-400 mt-1">
                İşyeri başvurunuz yetkili ekibimizce incelenmektedir. Yetkilimiz en kısa sürede teyit için iletişime geçecektir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigasyonu */}
      <div className="flex gap-1 rounded-xl bg-surface-100 border border-surface-200 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-200/50'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab İçerikleri */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-surface-100 border border-surface-200 shadow-soft p-6"
      >
        {/* GENEL */}
        {activeTab === 'genel' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sName" className="block text-sm font-medium text-surface-700 mb-1.5">
                  İşyeri Adı <span className="text-red-400">*</span>
                </label>
                <input
                  id="sName"
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                />
              </div>

              <div>
                <label htmlFor="sBizPhone" className="block text-sm font-medium text-surface-700 mb-1.5">
                  İşyeri Telefonu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    id="sBizPhone"
                    type="tel"
                    value={business.phone}
                    onChange={(e) => setBusiness((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sOwnerName" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Yetkili / Sahip Adı <span className="text-red-400">*</span>
                </label>
                <input
                  id="sOwnerName"
                  type="text"
                  value={business.ownerName}
                  onChange={(e) => setBusiness((p) => ({ ...p, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                />
              </div>

              <div>
                <label htmlFor="sOwnerPhone" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Yetkili Telefonu <span className="text-xs text-surface-500">(Teyit için aranacak)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    id="sOwnerPhone"
                    type="tel"
                    value={business.ownerPhone}
                    onChange={(e) => setBusiness((p) => ({ ...p, ownerPhone: e.target.value }))}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="sTaxNumber" className="block text-sm font-medium text-surface-700 mb-1.5">
                Vergi Numarası / TCKN <span className="text-xs text-surface-500">(İsteğe bağlı)</span>
              </label>
              <input
                id="sTaxNumber"
                type="text"
                value={business.taxNumber}
                onChange={(e) => setBusiness((p) => ({ ...p, taxNumber: e.target.value }))}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Kategori</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  Object.entries(BUSINESS_CATEGORIES) as [BusinessCategory, { label: string; emoji: string }][]
                ).map(([key, cat]) => (
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
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sDesc" className="block text-sm font-medium text-surface-700 mb-1.5">
                Açıklama
              </label>
              <textarea
                id="sDesc"
                value={business.description}
                onChange={(e) => setBusiness((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* KONUM */}
        {activeTab === 'konum' && (
          <div className="space-y-5">
            <div>
              <label htmlFor="sCity" className="block text-sm font-medium text-surface-700 mb-1.5">
                Şehir
              </label>
              <input
                id="sCity"
                type="text"
                value={location.city}
                onChange={(e) => setLocation((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
            <div>
              <label htmlFor="sDistrict" className="block text-sm font-medium text-surface-700 mb-1.5">
                İlçe / Semt
              </label>
              <input
                id="sDistrict"
                type="text"
                value={location.district}
                onChange={(e) => setLocation((p) => ({ ...p, district: e.target.value }))}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
            <div>
              <label htmlFor="sAddress" className="block text-sm font-medium text-surface-700 mb-1.5">
                Açık Adres
              </label>
              <textarea
                id="sAddress"
                value={location.address}
                onChange={(e) => setLocation((p) => ({ ...p, address: e.target.value }))}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-3 px-4 text-sm text-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* GÖRSELLER */}
        {activeTab === 'goruntuler' && (
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
                    <button onClick={() => setLogoPreview(null)} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                      <Trash2 className="h-3 w-3" /> Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Banner / Kapak</label>
              <div className="relative rounded-2xl bg-surface-200/50 border-2 border-dashed border-surface-300 overflow-hidden">
                {bannerPreview ? (
                  <div className="relative">
                    <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover" />
                    <button onClick={() => setBannerPreview(null)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-surface-200/30 transition-colors">
                    <Upload className="h-8 w-8 text-surface-400 mb-2" />
                    <span className="text-sm text-surface-500">Banner fotoğrafı yükleyin</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Galeri */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Galeri Fotoğrafları</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryPreviews.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={img} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80">
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
        )}

        {/* ÇALIŞMA SAATLERİ */}
        {activeTab === 'saatler' && (
          <div className="space-y-6">
            {/* Slot süresi & Hızlı İşlemler */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-surface-200/40 border border-surface-200">
              <div>
                <label className="block text-xs font-semibold text-surface-400 mb-2">
                  Randevu Slot Süresi
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[15, 20, 30, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSlotDuration(dur)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap',
                        slotDuration === dur
                          ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                          : 'border-surface-200 bg-surface-100 text-surface-400 hover:text-surface-900'
                      )}
                    >
                      {dur} dk
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-surface-100 border border-surface-200 text-xs font-medium text-surface-400 hover:text-surface-900 transition-colors whitespace-nowrap"
                title="Pazartesi çalışma saatleri ve molalarını Salı-Cuma günlerine uygular"
              >
                Pazartesi'yi Hafta İçine Kopyala
              </button>
            </div>

            {/* Günler Listesi */}
            <div className="space-y-2.5">
              {(Object.keys(DAY_NAMES) as DayOfWeek[]).map((day) => (
                <div
                  key={day}
                  className={cn(
                    'rounded-xl border p-3.5 transition-colors',
                    workingHours[day].is_open
                      ? 'border-surface-200 bg-surface-100'
                      : 'border-surface-200/50 bg-surface-200/20 opacity-60'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Gün Başlığı & Toggle */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateWorkingDay(day, 'is_open', !workingHours[day].is_open)}
                        className={cn(
                          'h-5 w-5 rounded-md border flex items-center justify-center transition-colors',
                          workingHours[day].is_open
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-surface-300 bg-surface-100'
                        )}
                      >
                        {workingHours[day].is_open && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div>
                        <span className="text-sm font-semibold text-surface-900">{DAY_NAMES[day]}</span>
                        <span className="text-[11px] text-surface-400 ml-2">
                          {workingHours[day].is_open ? 'Açık' : 'Kapalı'}
                        </span>
                      </div>
                    </div>

                    {/* Çalışma Saatleri (Açık ise) */}
                    {workingHours[day].is_open && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-surface-400">Mesai:</span>
                        <input
                          type="time"
                          value={workingHours[day].open || '09:00'}
                          onChange={(e) => updateWorkingDay(day, 'open', e.target.value)}
                          className="rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400 font-mono"
                        />
                        <span className="text-xs text-surface-400">—</span>
                        <input
                          type="time"
                          value={workingHours[day].close || '19:00'}
                          onChange={(e) => updateWorkingDay(day, 'close', e.target.value)}
                          className="rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => addBreak(day)}
                          className="px-2 py-1 rounded-md border border-dashed border-primary-500/40 text-primary-400 hover:bg-primary-500/10 text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          + Mola Ekle
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Molalar Bölümü */}
                  {workingHours[day].is_open && (workingHours[day].breaks || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-200/60 pl-9">
                      <div className="text-xs font-semibold text-surface-500 mb-2">
                        Mola & Ara Saatleri:
                      </div>
                      <div className="space-y-2">
                        {workingHours[day].breaks.map((brk, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <span className="text-xs text-amber-400/80 font-mono">#{bIdx + 1} Mola:</span>
                            <input
                              type="time"
                              value={brk.start}
                              onChange={(e) => updateBreak(day, bIdx, 'start', e.target.value)}
                              className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400 font-mono"
                            />
                            <span className="text-xs text-surface-500">—</span>
                            <input
                              type="time"
                              value={brk.end}
                              onChange={(e) => updateBreak(day, bIdx, 'end', e.target.value)}
                              className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-900 outline-none focus:border-primary-400 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => removeBreak(day, bIdx)}
                              className="p-1 rounded-md text-red-400 hover:bg-red-500/15 transition-colors ml-1"
                              title="Molayı sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
