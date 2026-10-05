'use client';

import { motion } from 'framer-motion';
import { Smartphone, ListChecks, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    icon: Smartphone,
    title: '60 Saniyede Kayıt Olun',
    description: 'İşletme adınızı, kategorinizi ve çalışma saatlerinizi girin. Kredi kartı gerekmeden kendi özel randevu linkiniz anında hazır olsun.',
    tag: 'Kolay Başlangıç',
    badgeColor: 'text-primary-400 bg-primary-500/15 border-primary-500/30',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Hizmet ve Ustalarınızı Ekleyin',
    description: 'Verdiğiniz hizmetleri (saç kesimi, fön, oto yıkama vb.), sürelerini, fiyatlarını ve personelinizi dakikalar içinde listeleyin.',
    tag: 'Özelleştirilebilir',
    badgeColor: 'text-accent-400 bg-accent-500/15 border-accent-400/30',
  },
  {
    step: '03',
    icon: QrCode,
    title: 'Linkinizi & QR Kodunuzu Paylaşın',
    description: 'Özel QR masa ve cam kartınızı bastırın, randevu linkinizi Instagram ve WhatsApp profilinize ekleyin. Randevular otomatik dolsun.',
    tag: '7/24 Randevu Akışı',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 border border-accent-400/30 px-4 py-1.5 text-xs font-semibold text-accent-300 tracking-wide mb-4 shadow-soft">
            🚀 3 Kolay Adımda Dijitalleşin
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Nasıl Çalışır?{' '}
            <span className="text-gradient-hero">Karmaşık Kurulum Yok</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-400">
            Teknik bilgi gerekmez. Telefonunuzdan 1 dakika içinde başlayıp bugün ilk online randevunuzu alın.
          </p>
        </div>

        {/* 3 Adım Kartları */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-3xl bg-surface-100/90 border border-surface-200 p-8 shadow-soft card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-50 border border-surface-200/90 text-primary-400 shadow-sm">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="font-mono text-4xl font-black text-surface-400/30">
                    {step.step}
                  </span>
                </div>

                <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-3 ${step.badgeColor}`}>
                  {step.tag}
                </span>

                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-200/60 flex items-center justify-between text-xs font-semibold text-primary-300">
                <span>Adım {i + 1} / 3</span>
                <span>Otomatik Entegrasyon &rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hızlı Başla Kutusu */}
        <div className="mt-12 text-center">
          <Link
            href="/isyeri-kayit"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-4 w-4 text-accent-200" />
            <span>60 Saniyede Kendi İşyerinizi Başlatın</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
