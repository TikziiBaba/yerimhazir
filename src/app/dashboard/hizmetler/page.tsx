'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Clock,
  GripVertical,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { createService, updateService, deleteService } from '@/app/actions';

type ServiceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
};

const INITIAL_SERVICES: ServiceItem[] = [];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 200,
    duration_minutes: 30,
  });

  // Gerçek Hizmetleri Yükle
  useEffect(() => {
    async function loadServices() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: bData } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();
          if (bData) {
            setBusinessId(bData.id);
            const { data: realServices } = await supabase
              .from('services')
              .select('*')
              .eq('business_id', bData.id)
              .order('sort_order', { ascending: true });

            if (realServices) {
              setServices(realServices.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                price: Number(s.price),
                duration_minutes: s.duration_minutes,
                is_active: s.is_active,
                sort_order: s.sort_order,
              })));
            } else {
              setServices([]);
            }
          }
        }
      } catch (e) {
        console.warn('Hizmetler yüklenirken fallback kullanıldı:', e);
      }
    }
    loadServices();
  }, []);

  const handleToggle = async (id: string) => {
    const target = services.find((s) => s.id === id);
    if (!target) return;
    const nextState = !target.is_active;

    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: nextState } : s))
    );
    toast.success('Hizmet durumu güncellendi');
    try {
      await updateService(id, { is_active: nextState });
    } catch (err) {
      console.warn('Hizmet güncelleme hatası:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success('Hizmet silindi');
    try {
      await deleteService(id);
    } catch (err) {
      console.warn('Hizmet silme hatası:', err);
    }
  };

  const handleAdd = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Hizmet adı ve fiyat zorunludur.');
      return;
    }
    const tempId = Date.now().toString();
    const newItem: ServiceItem = {
      id: tempId,
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes),
      is_active: true,
      sort_order: services.length + 1,
    };
    setServices((prev) => [...prev, newItem]);
    setNewService({ name: '', description: '', price: 200, duration_minutes: 30 });
    setShowAddForm(false);
    toast.success('Yeni hizmet başarıyla eklendi!');

    if (businessId) {
      try {
        const res = await createService(businessId, {
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          duration_minutes: newItem.duration_minutes,
        });
        if (res.success && res.data?.id) {
          setServices((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: res.data.id } : s)));
        }
      } catch (err) {
        console.warn('Hizmet ekleme action hatası:', err);
      }
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    try {
      await updateService(id, { [field]: value });
    } catch (err) {
      console.warn('Hizmet güncelleme hatası:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-surface-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Scissors className="inline h-6 w-6 mr-2 text-primary-400" />
            Hizmetler
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Müşterilere sunduğunuz hizmetleri yönetin
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Yeni Hizmet
        </button>
      </div>

      {/* Yeni hizmet formu */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-surface-100 border border-surface-200 shadow-soft p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary-400" />
                Yeni Hizmet Ekle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    Hizmet Adı <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                    placeholder="Saç Kesimi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">Açıklama</label>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                    placeholder="Kısa açıklama"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    Fiyat (₺) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newService.price || ''}
                    onChange={(e) => setNewService((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                    placeholder="150"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">Süre</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[15, 20, 30, 45, 60, 90].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setNewService((p) => ({ ...p, duration_minutes: dur }))}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap',
                          newService.duration_minutes === dur
                            ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                            : 'border-surface-200 text-surface-400 hover:text-surface-900'
                        )}
                      >
                        {dur} dk
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 rounded-lg border border-surface-200 text-xs sm:text-sm font-medium text-surface-400 hover:text-surface-900 hover:bg-surface-200/60 transition-colors whitespace-nowrap"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  className="px-3.5 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap inline-flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Ekle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hizmet Listesi */}
      <div className="space-y-3">
        {services.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-surface-100 border border-surface-200 text-surface-500">
            <Scissors className="h-10 w-10 mx-auto mb-2 text-surface-400 opacity-60" />
            <h3 className="text-base font-semibold text-surface-900 mb-1">Henüz hizmet eklenmemiş</h3>
            <p className="text-xs text-surface-400 mb-4 max-w-sm mx-auto">Müşterilerinizin randevu alabilmesi için sunduğunuz hizmetleri fiyat ve süreleriyle ekleyin.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              İlk Hizmeti Ekle
            </button>
          </div>
        ) : (
          services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
            className={cn(
              'rounded-xl bg-surface-100 border transition-colors',
              service.is_active
                ? 'border-surface-200 hover:border-surface-300'
                : 'border-surface-200/50 opacity-60'
            )}
          >
            {editingId === service.id ? (
              /* Düzenleme modu */
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleUpdate(service.id, 'name', e.target.value)}
                    className="rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                  />
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => handleUpdate(service.id, 'description', e.target.value)}
                    className="rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                  />
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => handleUpdate(service.id, 'price', Number(e.target.value))}
                    className="rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                    min={0}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {[15, 20, 30, 45, 60, 90].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleUpdate(service.id, 'duration_minutes', dur)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap',
                          service.duration_minutes === dur
                            ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                            : 'border-surface-200 text-surface-400 hover:text-surface-900'
                        )}
                      >
                        {dur} dk
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      toast.success('Hizmet güncellendi');
                    }}
                    className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap inline-flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              /* Görüntüleme modu */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-surface-400 cursor-grab shrink-0">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-surface-900 truncate">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-surface-400 mt-0.5 truncate">{service.description}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-200/60">
                  <div className="flex items-center gap-1.5 text-xs text-surface-400 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration_minutes} dk
                  </div>

                  <div className="text-sm font-bold text-surface-900 tabular-nums shrink-0">₺{service.price}</div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(service.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"
                      title={service.is_active ? 'Pasife Al' : 'Aktif Et'}
                    >
                      {service.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-surface-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(service.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors text-surface-400 hover:text-surface-900"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors text-surface-400 hover:text-rose-400"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )))}
      </div>
    </div>
  );
}
