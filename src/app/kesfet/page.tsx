'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Phone,
  Calendar,
  Tv,
  ArrowRight,
  Store,
  Scissors,
  Car,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import LandingHeader from '@/components/landing/header';
import LandingFooter from '@/components/landing/footer';

interface MarketplaceBusiness {
  id: string;
  name: string;
  slug: string;
  category: 'barber' | 'car_wash' | 'sports_pitch' | 'tattoo_studio' | 'tailor' | 'beauty_salon' | 'other';
  categoryLabel: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  coverEmoji: string;
  priceStartingAt: number;
  features: string[];
}

const INITIAL_VENUES: MarketplaceBusiness[] = [];

const CATEGORIES = [
  { key: 'all', label: 'Tüm Sektörler', icon: '✨' },
  { key: 'barber', label: 'Berber & Kuaför', icon: '✂️' },
  { key: 'car_wash', label: 'Oto Yıkama', icon: '🚗' },
  { key: 'sports_pitch', label: 'Halı Saha', icon: '⚽' },
  { key: 'beauty_salon', label: 'Güzellik & Spa', icon: '💅' },
  { key: 'tattoo_studio', label: 'Dövme Stüdyosu', icon: '🎨' },
  { key: 'tailor', label: 'Terzi & Kuru Temizleme', icon: '🧵' },
];

const CITIES = ['Tüm Şehirler', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'];

export default function KesfetPage() {
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tüm Şehirler');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Supabase'den gerçek onaylanmış işletmeleri yükle
  useEffect(() => {
    async function loadReal() {
      try {
        const supabase = createClient();
        const { data: realList } = await supabase
          .from('businesses')
          .select('id, name, slug, category, city, district, address, phone')
          .eq('is_active', true)
          .eq('approval_status', 'approved');

        if (realList && realList.length > 0) {
          const mapped: MarketplaceBusiness[] = realList.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            category: (b.category as any) || 'barber',
            categoryLabel: b.category === 'car_wash' ? 'Oto Yıkama' : b.category === 'sports_pitch' ? 'Halı Saha' : 'Berber & Kuaför',
            city: b.city || 'İstanbul',
            district: b.district || '',
            address: b.address || '',
            phone: b.phone || '',
            rating: 5.0,
            reviewCount: 0,
            nextAvailable: 'Randevu Açık',
            coverEmoji: b.category === 'car_wash' ? '🚗' : b.category === 'sports_pitch' ? '⚽' : '✂️',
            priceStartingAt: 150,
            features: ['Canlı Sıra TV', 'Online Randevu', 'Sıra Takibi'],
          }));

          setBusinesses(mapped);
        } else {
          setBusinesses([]);
        }
      } catch (err) {
        console.warn('Keşfet veritabanı yüklemesi fallback:', err);
      }
    }
    loadReal();
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (selectedCity !== 'Tüm Şehirler' && b.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchDistrict = b.district.toLowerCase().includes(q);
        const matchCat = b.categoryLabel.toLowerCase().includes(q);
        if (!matchName && !matchDistrict && !matchCat) return false;
      }
      return true;
    });
  }, [businesses, search, selectedCity, selectedCategory]);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-200 selection:bg-primary-500 selection:text-white">
      <LandingHeader />

      <main className="pt-24 pb-20">
        {/* HERO BAŞLIK & ARAMA VİTRİNİ */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold mb-4 shadow-soft">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Türkiye Geneli Yerel Esnaf Keşif Vitrini</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Beklemeden Hizmet Alın,{' '}
            <span className="text-gradient-hero">Yeriniz Hazır Olsun</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Semtinizdeki en iyi berber, kuaför, oto yıkama ve halı sahaları keşfedin. Üye olmadan saniyeler içinde randevu alın.
          </p>

          {/* ARAMA VE ŞEHİR FİLTRESİ KUTUSU */}
          <div className="mt-8 max-w-3xl mx-auto p-2.5 rounded-3xl bg-surface-100/90 border border-surface-200/80 shadow-elevated backdrop-blur-md flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İşletme adı, semt veya hizmet arayın..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-200/50 text-white placeholder:text-surface-400 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 transition-all border border-transparent focus:border-primary-500/40"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-8 py-3.5 rounded-2xl bg-surface-200/50 text-white text-sm outline-none border border-transparent focus:border-primary-500/40 cursor-pointer appearance-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-surface-100 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KATEGORİ BUTONLARI (HAPLAR) */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto mt-6 pb-2 scrollbar-hide max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all shrink-0',
                  selectedCategory === cat.key
                    ? 'bg-primary-500 text-white border-primary-400 shadow-glow-primary'
                    : 'bg-surface-100/70 border-surface-200/80 text-surface-400 hover:text-white hover:bg-surface-200/60'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* LİSTELEME ALANI */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-bold text-white">
              <span>{filtered.length} İşletme Bulundu</span>
            </div>
            <div className="text-xs text-surface-400">
              {selectedCity !== 'Tüm Şehirler' ? selectedCity : 'Tüm Türkiye'}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-surface-100/60 border border-surface-200/60">
              <Store className="h-12 w-12 text-surface-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-white">
                {businesses.length === 0 ? 'Henüz Onaylanmış İşletme Bulunmuyor' : 'Aradığınız kriterde işletme bulunamadı'}
              </h3>
              <p className="text-sm text-surface-400 mt-1 max-w-md mx-auto">
                {businesses.length === 0
                  ? 'YerimHazır platformunda ilk işletmeyi siz kaydedebilir veya yeni işletme başvurusu yapabilirsiniz.'
                  : 'Farklı bir anahtar kelime deneyebilir veya şehir filtresini "Tüm Şehirler" olarak değiştirebilirsiniz.'}
              </p>
              {businesses.length === 0 ? (
                <Link
                  href="/isyeri-kayit"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors shadow-soft"
                >
                  <Sparkles className="h-4 w-4" />
                  İşletmenizi Kaydedin
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCity('Tüm Şehirler');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((venue, i) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-3xl bg-surface-100/80 border border-surface-200/70 p-6 shadow-soft hover:shadow-elevated hover:border-primary-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Üst Satır: Kategori & Puan */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-200/60 text-xs font-semibold text-primary-300 border border-surface-200">
                        <span>{venue.coverEmoji}</span>
                        <span>{venue.categoryLabel}</span>
                      </span>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{venue.rating}</span>
                        <span className="text-[10px] text-surface-400">({venue.reviewCount})</span>
                      </div>
                    </div>

                    {/* Başlık & Konum */}
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors tracking-tight">
                      {venue.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-surface-400 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary-400 shrink-0" />
                      <span>{venue.district}, {venue.city}</span>
                    </div>

                    <p className="text-xs text-surface-500 mt-2 line-clamp-1">
                      {venue.address}
                    </p>

                    {/* Özellik Etiketleri */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {venue.features.map((feat) => (
                        <span
                          key={feat}
                          className="px-2.5 py-0.5 rounded-lg bg-surface-200/40 text-[10px] text-surface-300"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Alt Satır: Fiyat & Randevu Butonu */}
                  <div className="pt-5 mt-5 border-t border-surface-200/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{venue.nextAvailable}</span>
                      </div>
                      <div className="text-xs text-surface-400 mt-0.5">
                        Başlayan <strong className="text-white font-mono">₺{venue.priceStartingAt}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${venue.slug}/tv`}
                        target="_blank"
                        className="p-2.5 rounded-xl bg-surface-200/60 hover:bg-surface-200 text-surface-400 hover:text-white border border-surface-200 transition-colors"
                        title="Dükkan TV Sıra Ekranı"
                      >
                        <Tv className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/${venue.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-bold shadow-soft transition-all"
                      >
                        <span>Randevu Al</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
