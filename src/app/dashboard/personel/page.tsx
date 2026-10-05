'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { createStaff, updateStaff, deleteStaff } from '@/app/actions';

type StaffItem = {
  id: string;
  name: string;
  title: string;
  avatar_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const INITIAL_STAFF: StaffItem[] = [];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', title: '' });
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  // Gerçek personeli yükle
  useEffect(() => {
    async function loadStaff() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: bData } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();
          if (bData) {
            setBusinessId(bData.id);
            const { data: realStaff } = await supabase
              .from('staff')
              .select('*')
              .eq('business_id', bData.id)
              .order('sort_order', { ascending: true });

            if (realStaff) {
              setStaff(realStaff.map((st) => ({
                id: st.id,
                name: st.name,
                title: st.title || '',
                avatar_url: st.avatar_url,
                is_active: st.is_active,
                sort_order: st.sort_order,
              })));
            } else {
              setStaff([]);
            }
          }
        }
      } catch (e) {
        console.warn('Personel yüklenirken fallback kullanıldı:', e);
      }
    }
    loadStaff();
  }, []);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, staffId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (staffId) {
          setStaff((prev) =>
            prev.map((s) => (s.id === staffId ? { ...s, avatar_url: reader.result as string } : s))
          );
        } else {
          setNewAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleToggle = async (id: string) => {
    const target = staff.find((s) => s.id === id);
    if (!target) return;
    const nextState = !target.is_active;

    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: nextState } : s))
    );
    toast.success('Personel durumu güncellendi');
    try {
      await updateStaff(id, { is_active: nextState });
    } catch (err) {
      console.warn('Personel güncelleme hatası:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success('Personel silindi');
    try {
      await deleteStaff(id);
    } catch (err) {
      console.warn('Personel silme hatası:', err);
    }
  };

  const handleAdd = async () => {
    if (!newStaff.name) {
      toast.error('Personel adı zorunludur.');
      return;
    }
    const tempId = Date.now().toString();
    const newItem: StaffItem = {
      id: tempId,
      name: newStaff.name,
      title: newStaff.title,
      avatar_url: newAvatarPreview,
      is_active: true,
      sort_order: staff.length + 1,
    };
    setStaff((prev) => [...prev, newItem]);
    setNewStaff({ name: '', title: '' });
    setNewAvatarPreview(null);
    setShowAddForm(false);
    toast.success('Yeni personel başarıyla eklendi!');

    if (businessId) {
      try {
        const res = await createStaff(businessId, {
          name: newItem.name,
          title: newItem.title,
          avatar_url: newItem.avatar_url,
        });
        if (res.success && res.data?.id) {
          setStaff((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: res.data.id } : s)));
        }
      } catch (err) {
        console.warn('Personel ekleme action hatası:', err);
      }
    }
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    try {
      await updateStaff(id, { [field]: value });
    } catch (err) {
      console.warn('Personel güncelleme hatası:', err);
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
            <Users className="inline h-6 w-6 mr-2 text-primary-400" />
            Personel
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Çalışanlarınızı yönetin ve randevu atamalarını kontrol edin
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Personel Ekle
        </button>
      </div>

      {/* Yeni personel formu */}
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
                Yeni Personel Ekle
              </h3>
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-xl bg-surface-200/50 border border-dashed border-surface-300 flex items-center justify-center overflow-hidden">
                    {newAvatarPreview ? (
                      <img src={newAvatarPreview} alt="Avatar" className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <User className="h-7 w-7 text-surface-400" />
                    )}
                  </div>
                  <label className="text-xs text-primary-400 font-medium cursor-pointer hover:text-primary-300">
                    Fotoğraf Yükle
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e)} />
                  </label>
                </div>

                {/* Form */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">
                      Ad Soyad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                      placeholder="Ali Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">Ünvan</label>
                    <input
                      type="text"
                      value={newStaff.title}
                      onChange={(e) => setNewStaff((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 placeholder:text-surface-500 focus:border-primary-400 outline-none"
                      placeholder="Baş Berber"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setShowAddForm(false); setNewAvatarPreview(null); }}
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personel Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {staff.map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
            className={cn(
              'rounded-xl bg-surface-100 border transition-colors',
              person.is_active
                ? 'border-surface-200 hover:border-surface-300'
                : 'border-surface-200/50 opacity-60'
            )}
          >
            <div className="p-4 sm:p-5">
              {editingId === person.id ? (
                /* Düzenleme */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-surface-200/50 border border-surface-300 flex items-center justify-center overflow-hidden shrink-0">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-surface-400" />
                      )}
                    </div>
                    <label className="text-xs text-primary-400 font-medium cursor-pointer hover:text-primary-300">
                      <Upload className="inline h-3 w-3 mr-1" />
                      Değiştir
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, person.id)} />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => handleUpdate(person.id, 'name', e.target.value)}
                    className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                    placeholder="Ad Soyad"
                  />
                  <input
                    type="text"
                    value={person.title || ''}
                    onChange={(e) => handleUpdate(person.id, 'title', e.target.value)}
                    className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
                    placeholder="Ünvan"
                  />
                  <button
                    onClick={() => {
                      setEditingId(null);
                      toast.success('Personel güncellendi');
                    }}
                    className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Kaydet
                  </button>
                </div>
              ) : (
                /* Görüntüleme */
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-surface-200/60 border border-surface-300/50 flex items-center justify-center overflow-hidden shrink-0">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-surface-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-900 truncate">{person.name}</div>
                    {person.title && (
                      <div className="text-xs text-surface-400 mt-0.5 truncate">{person.title}</div>
                    )}
                    <div className={cn(
                      'text-[10px] font-medium mt-1',
                      person.is_active ? 'text-emerald-400' : 'text-surface-400'
                    )}>
                      {person.is_active ? '● Aktif' : '● Pasif'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(person.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"
                      title={person.is_active ? 'Pasife Al' : 'Aktif Et'}
                    >
                      {person.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-surface-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(person.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors text-surface-400 hover:text-surface-900"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors text-surface-400 hover:text-rose-400"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="rounded-2xl bg-surface-100 border border-surface-200 p-12 text-center">
          <Users className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-500">Henüz personel eklenmemiş.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300"
          >
            <Plus className="h-4 w-4" />
            İlk Personeli Ekle
          </button>
        </div>
      )}
    </div>
  );
}
