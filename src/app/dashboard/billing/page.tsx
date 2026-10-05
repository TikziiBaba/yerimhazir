'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Download,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentTier, setCurrentTier] = useState<'free_trial' | 'starter' | 'pro'>('free_trial');

  const handleSelectPlan = (planName: string) => {
    toast.success(`${planName} planına geçiş talebiniz alındı! PayTR entegrasyonu ile güvenli ödemeye yönlendiriliyorsunuz.`);
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
            <CreditCard className="inline h-6 w-6 mr-2 text-primary-400" />
            Abonelik & Fatura
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            İşletme paketiniz, kullanım limitleriniz ve fatura geçmişiniz
          </p>
        </div>
      </div>

      {/* Mevcut Plan Özeti Kartı */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-900/30 via-surface-100 to-surface-100 border border-primary-500/25 p-6 sm:p-8 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Aktif Deneme Sürümü
              </span>
              <span className="text-xs text-surface-400">14 Gün Ücretsiz</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-display)' }}>
              11 Gününüz Kaldı ⏳
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">
              {"Deneme süreniz boyunca YerimHazır'ın tüm profesyonel özelliklerinden sınırsız yararlanabilirsiniz. Süre dolduğunda işletmeniz kapanmaz, paket seçerek devam edebilirsiniz."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-surface-200/50 border border-surface-300/40 text-center">
              <div className="text-lg font-bold text-surface-900">42 / ∞</div>
              <div className="text-[11px] text-surface-400 mt-0.5">Bu Ay Randevu</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-200/50 border border-surface-300/40 text-center">
              <div className="text-lg font-bold text-surface-900">5 / ∞</div>
              <div className="text-[11px] text-surface-400 mt-0.5">Aktif Hizmet</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-200/50 border border-surface-300/40 text-center col-span-2 sm:col-span-1">
              <div className="text-lg font-bold text-surface-900">2 / ∞</div>
              <div className="text-[11px] text-surface-400 mt-0.5">Personel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Seçimi Toggle */}
      <div className="text-center pt-4">
        <h3 className="text-lg font-bold text-surface-900 mb-2">Paketinizi Seçin</h3>
        <p className="text-xs text-surface-500 mb-6">İhtiyacınıza uygun esnek paketler, taahhütsüz iptal imkanı</p>

        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-surface-100 border border-surface-200 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
              billingCycle === 'monthly'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-surface-500 hover:text-surface-800'
            )}
          >
            Aylık Ödeme
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
              billingCycle === 'yearly'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-surface-500 hover:text-surface-800'
            )}
          >
            Yıllık Ödeme
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              2 Ay Bedava
            </span>
          </button>
        </div>
      </div>

      {/* Plan Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Başlangıç */}
        <div className="rounded-2xl bg-surface-100 border border-surface-200 p-6 flex flex-col justify-between shadow-soft hover:border-surface-300 transition-colors">
          <div>
            <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
              {SUBSCRIPTION_PLANS.starter.name}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-surface-900">
                ₺{billingCycle === 'monthly' ? SUBSCRIPTION_PLANS.starter.monthlyPrice : Math.round(SUBSCRIPTION_PLANS.starter.yearlyPrice / 12)}
              </span>
              <span className="text-xs text-surface-400">/ ay</span>
            </div>
            <p className="text-xs text-surface-400 mb-6">Küçük ölçekli dükkanlar ve tek çalışanlı ustalar için ideal.</p>

            <ul className="space-y-2.5 mb-8">
              {SUBSCRIPTION_PLANS.starter.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-surface-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('Başlangıç')}
            className="w-full py-2.5 px-4 rounded-lg border border-surface-200 bg-surface-200/50 hover:bg-surface-200 text-xs sm:text-sm font-semibold text-surface-300 hover:text-surface-900 transition-colors whitespace-nowrap"
          >
            Başlangıç Paketine Geç
          </button>
        </div>

        {/* Profesyonel */}
        <div className="rounded-2xl bg-surface-100 border-2 border-primary-500/40 p-6 flex flex-col justify-between shadow-soft relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Popüler
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">
              {SUBSCRIPTION_PLANS.pro.name}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-surface-900">
                ₺{billingCycle === 'monthly' ? SUBSCRIPTION_PLANS.pro.monthlyPrice : Math.round(SUBSCRIPTION_PLANS.pro.yearlyPrice / 12)}
              </span>
              <span className="text-xs text-surface-400">/ ay</span>
            </div>
            <p className="text-xs text-surface-400 mb-6">Büyüyen işletmeler ve çoklu personel çalıştıran salonlar için.</p>

            <ul className="space-y-2.5 mb-8">
              {SUBSCRIPTION_PLANS.pro.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-surface-300">
                  <Check className="h-4 w-4 text-primary-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('Profesyonel')}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
          >
            Profesyonel Pakete Geç
          </button>
        </div>
      </div>

      {/* Fatura Geçmişi */}
      <div className="rounded-3xl bg-surface-100 border border-surface-200 p-6 shadow-soft">
        <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-400" />
          Fatura Geçmişi
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-surface-500">
                <th className="pb-3 font-semibold">Tarih</th>
                <th className="pb-3 font-semibold">Fatura No</th>
                <th className="pb-3 font-semibold">Açıklama</th>
                <th className="pb-3 font-semibold">Tutar</th>
                <th className="pb-3 font-semibold">Durum</th>
                <th className="pb-3 font-semibold text-right">Fatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60 text-surface-700">
              <tr>
                <td className="py-3 font-mono">{new Date().toLocaleDateString('tr-TR')}</td>
                <td className="py-3 font-mono">YH-2026-001</td>
                <td className="py-3">14 Günlük Ücretsiz Deneme</td>
                <td className="py-3 font-semibold">₺0.00</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[10px]">
                    Ödendi
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="p-1 hover:text-primary-400 transition-colors" title="İndir">
                    <Download className="h-3.5 w-3.5 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
