'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Store,
  LogIn,
  CheckCircle2,
  Calendar,
  MessageCircle,
  TrendingUp,
  QrCode,
  ShieldCheck,
  Star,
  Users,
  Clock,
} from 'lucide-react';

const FLOATING_CARDS = [
  { name: 'Mehmet B.', service: 'Saç Kesimi & Yıkama', time: '10:30', status: 'confirmed' as const, staff: 'Ahmet Usta', price: '₺250' },
  { name: 'Ali K.', service: 'Sakal Tıraşı & Bakım', time: '11:00', status: 'pending' as const, staff: 'Mehmet Kalfa', price: '₺150' },
  { name: 'Zeynep A.', service: 'Fön & Saç Bakımı', time: '11:45', status: 'confirmed' as const, staff: 'Ahmet Usta', price: '₺350' },
  { name: 'Emre Y.', service: 'Damat Tıraşı Paketi', time: '13:00', status: 'confirmed' as const, staff: 'Ahmet Usta', price: '₺750' },
];

const QUEUE_ITEMS = [
  { no: 'A-101', name: 'Hakan Aslan', wait: 'İçeride', staff: 'Ahmet Usta', service: 'Saç Kesimi' },
  { no: 'A-102', name: 'Serdar Güven', wait: '~8 dk kaldı', staff: 'Mehmet Kalfa', service: 'Sakal Tıraşı' },
  { no: 'A-103', name: 'Oğuzhan Kaya', wait: '~18 dk kaldı', staff: 'Sıradaki Usta', service: 'Saç + Sakal' },
];

const WHATSAPP_MSGS = [
  { phone: '0532 *** 45', text: 'Sayın Mehmet B., 10:30 randevunuz onaylandı. Randevu linkiniz: yerimhazir.com/r/8291', status: 'Teslim Edildi' },
  { phone: '0544 *** 88', text: 'Hatırlatma: Yarın 11:45 fön randevunuz bulunmaktadır. Değişiklik için tıklayın.', status: 'Okundu' },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'queue' | 'whatsapp'>('appointments');

  return (
    <section className="relative min-h-[94vh] flex items-center overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Lüks Arka Plan Işık Efektleri */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[650px] h-[650px] bg-gradient-to-bl from-primary-500/20 via-primary-700/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-accent-500/15 via-sky-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Sol Kolon - Başlık, Açıklama ve Net Butonlar */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Canlı Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500/15 via-surface-100 to-accent-500/15 border border-primary-500/30 px-4 py-1.5 mb-6 shadow-soft"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-surface-200 tracking-wide">
                Türkiye&apos;nin #1 Akıllı Esnaf & Randevu Ekosistemi
              </span>
              <span className="text-[10px] uppercase font-extrabold bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full border border-accent-400/30 hidden sm:inline">
                14 Gün Ücretsiz
              </span>
            </motion.div>

            {/* Ana Başlık */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-white">Randevuları</span>
              <br />
              <span className="text-gradient-hero">Cebinizden Yönetin</span>
              <span className="text-white">,</span>
              <br />
              <span className="text-white">Zamanınızı & Kazancınızı</span>
              <br />
              <span className="text-gradient-hero">İkiye Katlayın</span>
            </motion.h1>

            {/* Alt Başlık */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-surface-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Berber, kuaför, güzellik merkezi, oto yıkama ve halı sahalar için{' '}
              <strong className="text-white font-semibold">60 saniyede</strong> kendi randevu sayfanızı oluşturun.{' '}
              Müşterileriniz 7/24 online randevu alsın, otomatik <span className="text-emerald-400 font-semibold">WhatsApp teyitleri</span> ile iptaller sıfırlansın, dükkandaki sırayı QR kodla yönetin.
            </motion.p>

            {/* BUTONLAR - KULLANICININ İSTEDİĞİ GİRİŞ & İŞYERİ VE KAYIT BUTONLARI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3.5 justify-center lg:justify-start items-center"
            >
              {/* 1. İşyeri Kaydı (14 Gün Ücretsiz Başla) */}
              <Link
                href="/isyeri-kayit"
                className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 px-7 py-4 text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Sparkles className="h-5 w-5 text-accent-200 group-hover:rotate-12 transition-transform" />
                <span>14 Gün Ücretsiz Başla</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* 2. İŞYERİ GİRİŞİ BUTONU (Kullanıcının özellikle istediği ana buton) */}
              <Link
                href="/isyeri-giris"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-primary-500/40 bg-surface-100/95 hover:bg-primary-500/15 hover:border-primary-400 px-6 py-4 text-sm sm:text-base font-bold text-primary-300 hover:text-white shadow-soft hover:shadow-glow-primary transition-all duration-300"
              >
                <Store className="h-5 w-5 text-primary-400" />
                <span>İşyeri Girişi</span>
              </Link>

              {/* 3. MÜŞTERİ GİRİŞ YAP BUTONU */}
              <Link
                href="/giris"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-surface-200/40 hover:bg-surface-200/80 px-5 py-4 text-sm sm:text-base font-semibold text-surface-200 hover:text-white transition-all duration-300"
              >
                <LogIn className="h-4.5 w-4.5 text-surface-400" />
                <span>Giriş Yap</span>
              </Link>
            </motion.div>

            {/* Güven ve Sosyal Kanıt Barı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-9 pt-7 border-t border-surface-200/70 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-surface-50">AY</div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-surface-50">BK</div>
                  <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold border-2 border-surface-50">MŞ</div>
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    4.9 / 5.0 Memnuniyet
                  </div>
                  <div className="text-surface-400">1,850+ Esnaf ve İşletme</div>
                </div>
              </div>

              <div className="h-8 w-px bg-surface-200/80 hidden sm:block" />

              <div className="text-left text-xs">
                <div className="font-bold text-white">120,000+ Randevu</div>
                <div className="text-emerald-400 font-medium">%0 No-Show Garantisi</div>
              </div>

              <div className="h-8 w-px bg-surface-200/80 hidden sm:block" />

              <div className="text-left text-xs">
                <div className="font-bold text-white">Kredi Kartı Gerekmez</div>
                <div className="text-surface-400">İlk 14 gün tamamen ücretsiz</div>
              </div>
            </motion.div>
          </div>

          {/* Sağ Kolon - Milyon Dolarlık İnteraktif Dashboard & Canlı Sıra Mockup'ı */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              {/* Ana Mockup Çerçevesi */}
              <div className="rounded-3xl bg-surface-100 border border-surface-200/90 shadow-elevated overflow-hidden backdrop-blur-xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#161c33] via-[#1e264d] to-[#12182c] p-5 border-b border-surface-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md text-xl">
                        ✂️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-white font-bold text-sm sm:text-base">Ahmet Usta Erkek Kuaförü</h2>
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-primary-300 text-xs font-mono">yerimhazir.com/ahmet-usta</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                        <TrendingUp className="h-3 w-3" />
                        Açık
                      </span>
                    </div>
                  </div>

                  {/* 3 İnteraktif Sekme */}
                  <div className="grid grid-cols-3 p-1 bg-surface-50/70 rounded-xl mt-4 border border-surface-200/60">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'appointments'
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Randevular
                    </button>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'queue'
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Canlı Sıra
                    </button>
                    <button
                      onClick={() => setActiveTab('whatsapp')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'whatsapp'
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Dinamik Liste İçeriği */}
                <div className="p-4 space-y-2.5 min-h-[260px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'appointments' && (
                      <motion.div
                        key="apt-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5"
                      >
                        {FLOATING_CARDS.map((card) => (
                          <div
                            key={card.name}
                            className="flex items-center justify-between p-3 rounded-2xl bg-surface-50/80 border border-surface-200/70 hover:border-primary-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-primary-500/15 border border-primary-500/25 text-primary-300 font-black text-xs">
                                {card.time}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{card.name}</div>
                                <div className="text-[11px] text-surface-400">
                                  {card.service} • <span className="text-primary-300">{card.staff}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-white block">{card.price}</span>
                              <span className="text-[10px] font-bold text-emerald-400">Onaylı</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'queue' && (
                      <motion.div
                        key="queue-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5"
                      >
                        {QUEUE_ITEMS.map((q) => (
                          <div
                            key={q.no}
                            className="flex items-center justify-between p-3 rounded-2xl bg-surface-50/80 border border-surface-200/70"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-accent-500/15 border border-accent-500/30 text-accent-300 font-mono font-bold text-xs">
                                {q.no}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{q.name}</div>
                                <div className="text-[11px] text-surface-400">{q.service} • {q.staff}</div>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {q.wait}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'whatsapp' && (
                      <motion.div
                        key="wa-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5"
                      >
                        {WHATSAPP_MSGS.map((msg, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                              <span>WhatsApp Bildirimi ({msg.phone})</span>
                              <span className="text-emerald-400 font-mono">{msg.status} ✓✓</span>
                            </div>
                            <p className="text-xs text-surface-300 leading-relaxed font-sans">{msg.text}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Alt Hızlı Eylemler */}
                <div className="p-4 pt-2 border-t border-surface-200/60 bg-surface-100/50 flex gap-2">
                  <Link
                    href="/isyeri-giris"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 text-xs font-bold text-primary-300 hover:text-white transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" />
                    İşletme Girişi Yap
                  </Link>
                  <Link
                    href="/isyeri-kayit"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Ücretsiz Başla
                  </Link>
                </div>
              </div>

              {/* Floating Bildirim Rozeti - WhatsApp / SMS */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="absolute -top-5 -right-4 glass rounded-2xl px-4 py-2.5 shadow-elevated border border-surface-200/90 hidden sm:flex items-center gap-2.5"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">WhatsApp Otomasyonu ✓</div>
                  <div className="text-[10px] text-surface-400">Randevu teyidi anında iletildi</div>
                </div>
              </motion.div>

              {/* Floating QR Rozeti */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="absolute -bottom-5 -left-4 glass rounded-2xl px-4 py-2.5 shadow-elevated border border-surface-200/90 hidden sm:flex items-center gap-2.5"
              >
                <div className="h-8 w-8 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Masa & Cam QR Kartı</div>
                  <div className="text-[10px] text-surface-400">Bekleyen müşteri sırasını izliyor</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
