'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calculator, ArrowRight, Clock, DollarSign, Users, Check } from 'lucide-react';

export default function RoiCalculatorSection() {
  const [dailyAppointments, setDailyAppointments] = useState(12);
  const [averagePrice, setAveragePrice] = useState(250);

  // Hesaplamalar
  const monthlyAppointments = dailyAppointments * 26; // 26 iş günü
  const monthlyPhoneTimeMinutes = monthlyAppointments * 4; // randevu başına 4 dk telefon
  const monthlySavedHours = Math.round(monthlyPhoneTimeMinutes / 60);
  const preventedNoShows = Math.round(monthlyAppointments * 0.15); // %15 iptal önleme
  const savedRevenue = preventedNoShows * averagePrice;
  const newCustomerGain = Math.round(monthlyAppointments * 0.20 * averagePrice); // 7/24 randevu ile ek müşteri

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-surface-100 via-surface-100 to-primary-950/40 border border-primary-500/30 p-8 sm:p-12 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Sol: Slider Ayarları */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 border border-accent-400/30 px-3.5 py-1 text-xs font-bold text-accent-300 tracking-wide mb-3">
                  <Calculator className="h-3.5 w-3.5" />
                  İnteraktif Kazanç Hesaplayıcı
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  YerimHazır Size Ne Kadar Kazandırır?
                </h2>
                <p className="mt-2 text-sm text-surface-400">
                  Dükkanınızın günlük randevu sayısını ve ortalama sepet tutarını seçin, tasarruf edeceğiniz zamanı ve ek geliri görün.
                </p>
              </div>

              {/* Slider 1: Günlük Randevu Sayısı */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-surface-300">Günde Kaç Randevu Alıyorsunuz?</span>
                  <span className="text-xl font-black text-primary-400 font-mono">{dailyAppointments} randevu / gün</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="50"
                  value={dailyAppointments}
                  onChange={(e) => setDailyAppointments(Number(e.target.value))}
                  className="w-full h-2.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-[11px] text-surface-500">
                  <span>3 randevu</span>
                  <span>25 randevu</span>
                  <span>50+ randevu</span>
                </div>
              </div>

              {/* Slider 2: Ortalama Hizmet Fiyatı */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-surface-300">Ortalama İşlem / Hizmet Ücreti</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">₺{averagePrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-surface-500">
                  <span>₺50</span>
                  <span>₺500</span>
                  <span>₺1,500+</span>
                </div>
              </div>
            </div>

            {/* Sağ: Hesaplanan Değerler & Sonuç Kartı */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-surface-50/90 border border-surface-200 p-7 sm:p-8 space-y-6 shadow-soft">
                <h3 className="text-sm font-bold text-surface-400 uppercase tracking-wider">
                  Aylık Tahmini Tasarruf & Kazancınız:
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Zaman Tasarrufu */}
                  <div className="p-4 rounded-2xl bg-surface-100 border border-surface-200/80">
                    <div className="flex items-center gap-2 text-primary-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-bold">Zaman Tasarrufu</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{monthlySavedHours} Saat</div>
                    <p className="text-[11px] text-surface-400 mt-1">Gereksiz telefon konuşmalarından kurtulursunuz</p>
                  </div>

                  {/* İptal Önleme Geliri */}
                  <div className="p-4 rounded-2xl bg-surface-100 border border-surface-200/80">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-bold">Kurtarılan Gelir</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      ₺{savedRevenue.toLocaleString('tr-TR')}
                    </div>
                    <p className="text-[11px] text-surface-400 mt-1">WhatsApp hatırlatmaları ile kurtarılan ciro</p>
                  </div>
                </div>

                {/* Ek Müşteri Hacmi Bannerı */}
                <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-primary-300 font-bold">7/24 Online Randevu ile Ek Gelir:</div>
                    <div className="text-lg font-black text-white mt-0.5">+₺{newCustomerGain.toLocaleString('tr-TR')} / ay</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                      +%20 Doluluk Artışı
                    </span>
                  </div>
                </div>

                <Link
                  href="/isyeri-kayit"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-glow-primary hover:scale-[1.01] transition-all group"
                >
                  <Sparkles className="h-4 w-4 text-accent-200" />
                  <span>Bu Kazancı Dükkanınıza Kazandırın (14 Gün Ücretsiz)</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
