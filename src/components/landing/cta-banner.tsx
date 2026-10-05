'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 p-8 sm:p-14 shadow-glow-primary text-center relative overflow-hidden">
          {/* Arka plan ışıltıları */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent-200" />
              14 Gün Boyunca Sıfır Risk İle Deneyin
            </span>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Defteri ve Ajandayı Bugün Çöpe Atın,{' '}
              <br className="hidden sm:inline" />
              Dükkanınızı Dijitale Taşıyın.
            </h2>

            <p className="text-base sm:text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Binlerce berber, kuaför ve esnaf YerimHazır ile telefon trafiğini bitirdi, gelirini artırdı. 60 saniyede siz de katılın.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/isyeri-kayit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-primary-900 font-black text-base shadow-xl hover:bg-surface-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
              >
                <Sparkles className="h-5 w-5 text-primary-600" />
                <span>14 Gün Ücretsiz Başla</span>
                <ArrowRight className="h-4 w-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/isyeri-giris"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-primary-900/40 hover:bg-primary-900/60 border border-white/20 text-white font-bold text-base transition-colors"
              >
                <Store className="h-4.5 w-4.5" />
                <span>İşyeri Girişi Yap</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-primary-100 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent-300" /> Kredi kartı gerekmez
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent-300" /> 60 saniyede hazır
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent-300" /> İstediğin an iptal
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
