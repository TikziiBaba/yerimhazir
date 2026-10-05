'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  Car,
  Goal,
  Palette,
  CheckCircle2,
  ArrowRight,
  Clock,
  TrendingUp,
  Store,
} from 'lucide-react';

const INDUSTRIES = [
  {
    id: 'barber',
    title: 'Berber & Kuaför',
    icon: Scissors,
    tagline: 'Koltuklar boş kalmasın, telefon trafiği son bulsun',
    metrics: { bookings: '850+ randevu/ay', timeSaved: '40 saat/ay', noShowReduction: '%92 iptal azalışı' },
    features: [
      'Usta bazlı çalışma saatleri ve mola takvimi',
      'Saç, sakal, bakım ve damat tıraşı süre tanımlamaları',
      'Cam QR koduyla dükkan önünden anında randevu',
      'Müşteriye otomatik WhatsApp teyidi ve hatırlatması',
    ],
    preview: {
      business: 'Efsane Berber Salonu',
      services: ['Saç Kesimi (30 dk)', 'Sakal Bakımı (20 dk)', 'Cilt Maskesi (25 dk)'],
      testimonial: '"Önceden tıraş yaparken 10 kere telefon açmak zorunda kalıyordum. Şimdi herkes kendi randevusunu alıyor, akşam kasam da takvimim de net."',
      author: 'Kemal Usta • Kadıköy',
    },
  },
  {
    id: 'beauty',
    title: 'Güzellik & Estetik',
    icon: Sparkles,
    tagline: 'Seanslı işlemler ve uzman randevuları kusursuz işlesin',
    metrics: { bookings: '1,200+ randevu/ay', timeSaved: '55 saat/ay', noShowReduction: '%95 iptal azalışı' },
    features: [
      'Lazer, cilt bakımı ve protez tırnak için seans takibi',
      'Uzman estetisyen seçimi ve oda/makine kapasite planlaması',
      'Otomatik kapora ve ön ödeme tahsilatı',
      'Kişiye özel bakım kartı ve randevu geçmişi',
    ],
    preview: {
      business: 'Aura Güzellik & Spa',
      services: ['Lazer Epilasyon', 'Medikal Cilt Bakımı', 'Protez Tırnak'],
      testimonial: '"No-show iptalleri yüzünden haftada binlerce lira kaybediyorduk. WhatsApp hatırlatması ve kapora özelliği ile iptaller tamamen sıfırlandı."',
      author: 'Selin Hanım • Nişantaşı',
    },
  },
  {
    id: 'carwash',
    title: 'Oto Yıkama & Detailing',
    icon: Car,
    tagline: 'Peronları tam kapasite doldurun, araç kuyruklarını düzenleyin',
    metrics: { bookings: '620+ araç/ay', timeSaved: '35 saat/ay', noShowReduction: '%88 sıra düzeni' },
    features: [
      'Peron 1, Peron 2 ve Lift bazlı araç kabulü',
      'İç-dış yıkama, seramik kaplama, pasta cila süresi',
      'Müşteri araç plakasını girerek anında randevu alır',
      'Araç hazır olduğunda müşteriye "Aracınız Hazır" SMS\'i',
    ],
    preview: {
      business: 'Speed Detailing Garaj',
      services: ['İç & Dış VIP Yıkama', 'Boya Koruma & Cila', 'Detaylı İç Kuaför'],
      testimonial: '"Müşteriler plakasını girip saatini seçiyor. Dükkanda araba kuyruğu bitti, herkes tam saatinde geliyor."',
      author: 'Murat Şahin • Bursa',
    },
  },
  {
    id: 'sports',
    title: 'Halı Saha & Tesisler',
    icon: Goal,
    tagline: 'Maç saatleri otomatik dolsun, kapora derdi bitsin',
    metrics: { bookings: '240+ maç/ay', timeSaved: '30 saat/ay', noShowReduction: '%100 kapora güveni' },
    features: [
      'Gece ve gündüz saatlik saha takvimi (19:00, 20:00, 21:00...)',
      'Halı saha kapora tahsilatı ve otomatik teyit',
      'Düzenli haftalık abonman maçları otomatik kilitleme',
      'Kadro iptal durumlarında bekleme listesine anında haber',
    ],
    preview: {
      business: 'Arena Spor Tesisleri',
      services: ['Saha 1 (7v7)', 'Saha 2 (6v6)', 'Gece Aydınlatmalı Maç'],
      testimonial: '"Abonmanlar ve tek maçlar karışmıyor. Kapora almadan maç ayırtma devri bitti, kasamız güvende."',
      author: 'Ali Vural • Ankara',
    },
  },
];

export default function IndustrySolutionsSection() {
  const [activeTab, setActiveTab] = useState(INDUSTRIES[0].id);
  const currentIndustry = INDUSTRIES.find((i) => i.id === activeTab) || INDUSTRIES[0];

  return (
    <section id="sektorler" className="py-20 lg:py-28 bg-surface-100/50 border-y border-surface-200/70 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 px-4 py-1.5 text-xs font-semibold text-primary-300 tracking-wide mb-4 shadow-soft">
            🎯 Sektörünüze Özel Çözümler
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hangi Sektörde Olursanız Olun,{' '}
            <span className="text-gradient-hero">Sizin İçin Tasarlandı</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-400">
            Farklı mesleklerin farklı ihtiyaçları vardır. YerimHazır, dükkanınızın çalışma şekline tam uyum sağlar.
          </p>
        </div>

        {/* Sektör Sekmeleri */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
          {INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            const isActive = ind.id === activeTab;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveTab(ind.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow-primary scale-105'
                    : 'bg-surface-100 border border-surface-200 text-surface-400 hover:text-white hover:bg-surface-200/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{ind.title}</span>
              </button>
            );
          })}
        </div>

        {/* Seçili Sektör Detay Kartı */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndustry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-surface-100 border border-surface-200/90 shadow-elevated p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Sol: Özellikler ve Metrikler */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {currentIndustry.title} İçin Özel Altyapı
                  </h3>
                  <p className="text-base text-primary-300 font-medium mt-1">
                    {currentIndustry.tagline}
                  </p>
                </div>

                {/* 3 İstatistik Kutusu */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80">
                    <div className="text-base sm:text-lg font-black text-white">{currentIndustry.metrics.bookings}</div>
                    <div className="text-[11px] text-surface-400 mt-0.5">Randevu Hacmi</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80">
                    <div className="text-base sm:text-lg font-black text-emerald-400">{currentIndustry.metrics.timeSaved}</div>
                    <div className="text-[11px] text-surface-400 mt-0.5">Tasarruf Edilen Süre</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80">
                    <div className="text-base sm:text-lg font-black text-accent-400">{currentIndustry.metrics.noShowReduction}</div>
                    <div className="text-[11px] text-surface-400 mt-0.5">İptal Oranı Düşüşü</div>
                  </div>
                </div>

                {/* Özellik Listesi */}
                <ul className="space-y-3">
                  {currentIndustry.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-surface-300">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Link
                    href="/isyeri-kayit"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-sm font-bold text-white shadow-md hover:shadow-glow-primary transition-all group"
                  >
                    <span>{currentIndustry.title} Sayfanızı Hemen Açın</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Sağ: Gerçekçi Esnaf Önizleme Kartı */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-surface-50 border border-surface-200 p-6 space-y-4 shadow-soft">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-200/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{currentIndustry.preview.business}</div>
                        <div className="text-xs text-primary-300">yerimhazir.com/demo</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Randevu Açık
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Tanımlı Örnek Hizmetler:</span>
                    {currentIndustry.preview.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100/90 border border-surface-200/70 text-xs">
                        <span className="text-white font-medium">{srv}</span>
                        <span className="text-accent-400 font-bold">Seç &rarr;</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs space-y-2">
                    <p className="text-surface-300 italic leading-relaxed">
                      {currentIndustry.preview.testimonial}
                    </p>
                    <div className="text-[11px] font-bold text-white text-right">
                      — {currentIndustry.preview.author}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
