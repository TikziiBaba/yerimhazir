'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  MessageCircle,
  Smartphone,
  Users,
  TrendingUp,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesSection() {
  return (
    <section id="ozellikler" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Ambiyans arka plan ışıkları */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 px-4 py-1.5 text-xs font-semibold text-primary-300 tracking-wide mb-4 shadow-soft">
            ⚡ Üstün Yetenekler
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            İşinizi Büyütecek Her Şey{' '}
            <span className="text-gradient-hero">Tek Ekranda</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-400">
            Defter ve ajanda devrini kapatın. Modern bir işletmenin ihtiyacı olan tüm akıllı araçlar bir arada.
          </p>
        </div>

        {/* BENTO GRID DÜZENİ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1. BENTO: Canlı QR Sıra Takibi (Büyük Kart - 8 Kolon) */}
          <div className="md:col-span-12 lg:col-span-8 rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-9 shadow-elevated relative overflow-hidden group card-hover">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs font-bold">
                  <QrCode className="h-3.5 w-3.5" />
                  Masa & Cam QR Çözümü
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Canlı Sıra Takibi & QR Masa Kartı
                </h3>
                <p className="text-sm text-surface-400 leading-relaxed">
                  Müşterileriniz dükkana geldiğinde masadaki veya camdaki QR kodu okutarak sırasını alır. Otururken telefonundan kaçıncı sırada olduğunu ve tahmini bekleme süresini canlı takip eder. Sıra kargaşası ve tartışmalar son bulur.
                </p>
                <div className="flex flex-wrap gap-2 pt-2 text-xs text-surface-300 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Otomatik bilet numarası
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> TV / Ekran uyumlu sıra panosu
                  </span>
                </div>
              </div>

              {/* Sağdaki Görsel Simülasyon */}
              <div className="sm:col-span-5">
                <div className="rounded-2xl bg-surface-50 border border-surface-200/90 p-4 space-y-3 shadow-soft">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-200/60 font-bold">
                    <span className="text-white">Dükkan Canlı Sırası</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Canlı
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-500/15 border border-primary-500/30">
                      <span className="font-mono font-bold text-primary-300 text-xs">#A-101 (Koltuk 1)</span>
                      <span className="text-xs font-bold text-white">İçeride</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 border border-surface-200/70">
                      <span className="font-mono font-bold text-surface-300 text-xs">#A-102 (Sıradaki)</span>
                      <span className="text-xs text-amber-400 font-semibold">~6 dk kaldı</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 border border-surface-200/70">
                      <span className="font-mono font-bold text-surface-300 text-xs">#A-103 (Bekleyen)</span>
                      <span className="text-xs text-surface-400">~18 dk kaldı</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BENTO: Otomatik WhatsApp & SMS Teyitleri (4 Kolon) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-8 shadow-elevated relative overflow-hidden card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <MessageCircle className="h-3.5 w-3.5" />
                Sıfır No-Show İptal
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Otomatik WhatsApp & SMS Hatırlatma
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
                Randevusunu unutan müşterilere randevudan 24 saat ve 2 saat önce otomatik hatırlatma mesajı gider. Boş kalan koltukları unutun, cironuz korunsun.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                <span>WhatsApp Onay Mesajı</span>
                <span className="text-emerald-400">İletildi ✓✓</span>
              </div>
              <p className="text-xs text-surface-300 leading-snug">
                &quot;Sayın Ahmet Y., yarın 14:00 saç kesimi randevunuz bulunmaktadır. Değişiklik için tıklayın.&quot;
              </p>
            </div>
          </div>

          {/* 3. BENTO: Özel Mağaza Web Sayfası (4 Kolon) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-8 shadow-soft card-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-bold">
                <Smartphone className="h-3.5 w-3.5" />
                Özel Alan Adı Linki
              </div>
              <h3 className="text-xl font-bold text-white">
                yerimhazir.com/dukkaniniz
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
                Instagram biyografinize, WhatsApp profilinize ve Google Haritalar profilinize ekleyeceğiniz şık ve hızlı randevu web siteniz 60 saniyede açılır.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-200/60 flex items-center justify-between text-xs font-bold text-primary-300">
              <span>Mobil & Masaüstü Uyumlu</span>
              <span>7/24 Kesintisiz</span>
            </div>
          </div>

          {/* 4. BENTO: Personel ve Usta Takvimi (4 Kolon) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-8 shadow-soft card-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Users className="h-3.5 w-3.5" />
                Ekip & Koltuk Yönetimi
              </div>
              <h3 className="text-xl font-bold text-white">
                Usta ve Personel Takvimleri
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
                Her ustanın ve personelin çalışma saatleri, molaları ve uzmanlıkları ayrıdır. Müşteri istediği ustayı seçerek randevu alabilir.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-200/60 flex items-center justify-between text-xs font-bold text-purple-300">
              <span>Ayrı Ciro Takibi</span>
              <span>Bireysel Mola Planı</span>
            </div>
          </div>

          {/* 5. BENTO: Ciro & Doluluk Raporları (4 Kolon) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-8 shadow-soft card-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                Gelişmiş Finans
              </div>
              <h3 className="text-xl font-bold text-white">
                Anlık Gelir & Doluluk Analizi
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
                Hangi gün ve saatler en yoğun? Hangi hizmet en çok kazandırıyor? Nakit ve kart tahsilatlarınızı net raporlarla anında görün.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-200/60 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Günlük/Aylık Kasa</span>
              <span>Hizmet Dağılımı</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
