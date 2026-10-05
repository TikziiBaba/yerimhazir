'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="fiyatlandirma" className="py-20 lg:py-28 bg-surface-50 relative overflow-hidden">
      {/* Arka plan deseni ve ambiyans ışıkları */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 px-4 py-1.5 text-xs font-semibold text-primary-300 tracking-wide mb-4 shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
            Şeffaf & Esnaf Dostu Fiyatlar
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            İhtiyacınıza Uygun
            <span className="text-gradient-hero"> Şeffaf Paketler</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-500">
            Gizli maliyet yok, taahhüt yok. İlk 14 gün tamamen ücretsiz deneyin.
          </p>
        </motion.div>

        {/* Aylık / Yıllık Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-surface-500'}`}>
            Aylık
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors border ${
              isYearly ? 'bg-primary-500 border-primary-400' : 'bg-surface-200 border-surface-300'
            }`}
            role="switch"
            aria-checked={isYearly}
            aria-label="Yıllık fiyatlandırmaya geç"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-white' : 'text-surface-500'}`}>
            Yıllık
          </span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 border border-accent-400/30 px-3 py-1 text-xs font-bold text-accent-400"
            >
              🎉 2 Ay Hediye
            </motion.span>
          )}
        </motion.div>

        {/* Fiyat Kartları */}
        <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
          {/* Başlangıç Planı */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-between rounded-3xl bg-surface-100/90 border border-surface-200/90 p-8 card-hover shadow-soft hover:border-surface-300"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-11 w-11 rounded-2xl bg-surface-200/80 border border-surface-300/50 flex items-center justify-center text-surface-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{SUBSCRIPTION_PLANS.starter.name}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Bireysel ve küçük işletmeler için</p>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-surface-200/80">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">
                    ₺{isYearly
                      ? Math.round(SUBSCRIPTION_PLANS.starter.yearlyPrice / 12)
                      : SUBSCRIPTION_PLANS.starter.monthlyPrice}
                  </span>
                  <span className="text-surface-500 text-sm font-medium">/ay</span>
                </div>
                {isYearly && (
                  <p className="text-xs text-surface-500 mt-1.5">
                    Yıllık toplam: ₺{SUBSCRIPTION_PLANS.starter.yearlyPrice}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_PLANS.starter.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-surface-200/80 border border-surface-300/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-surface-400" />
                    </div>
                    <span className="text-sm text-surface-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/kayit?plan=starter"
              className="block text-center rounded-2xl border border-surface-200 bg-surface-200/50 hover:bg-surface-200 hover:border-surface-300 text-surface-300 hover:text-white py-3.5 text-sm font-bold transition-all duration-200 shadow-soft"
            >
              14 Gün Ücretsiz Başla
            </Link>
          </motion.div>

          {/* Profesyonel Plan (Gelişmiş Vurgulu Kart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#12192d] to-[#0a0f1d] border-2 border-primary-500/60 p-8 text-white shadow-[0_0_50px_-10px_rgba(99,102,241,0.3)] card-hover"
          >
            {/* Popüler rozeti */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary-500/25 tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                En Çok Tercih Edilen
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-11 w-11 rounded-2xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-300 shadow-inner">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{SUBSCRIPTION_PLANS.pro.name}</h3>
                  <p className="text-xs text-primary-300/80 mt-0.5">Büyüyen ve yoğun işletmeler için</p>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-surface-200/80">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    ₺{isYearly
                      ? Math.round(SUBSCRIPTION_PLANS.pro.yearlyPrice / 12)
                      : SUBSCRIPTION_PLANS.pro.monthlyPrice}
                  </span>
                  <span className="text-surface-400 text-sm font-medium">/ay</span>
                </div>
                {isYearly && (
                  <p className="text-xs text-accent-400 mt-1.5 font-medium">
                    Yıllık faturalandırılır (₺{SUBSCRIPTION_PLANS.pro.yearlyPrice}/yıl)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_PLANS.pro.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary-300" />
                    </div>
                    <span className="text-sm text-surface-200 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/kayit?plan=pro"
              className="block text-center rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-indigo-600 hover:from-primary-400 hover:to-primary-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/35 hover:shadow-primary-500/50 hover:scale-[1.01] transition-all duration-300"
            >
              14 Gün Ücretsiz Başla
            </Link>
          </motion.div>
        </div>

        {/* Alt not */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-surface-500 mt-10"
        >
          Tüm paketlerde 14 gün ücretsiz kullanım dahildir. İstediğiniz an iptal edebilirsiniz.
        </motion.p>
      </div>
    </section>
  );
}
