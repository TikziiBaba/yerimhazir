'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv,
  Clock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  QrCode as QrCodeIcon,
  Store,
  ChevronLeft,
  BellRing,
} from 'lucide-react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getBusinessBySlug } from '@/app/actions';

export default function TvWaitingScreen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [business, setBusiness] = useState<any>({
    name: 'Ahmet Usta Berber & Saç Tasarım',
    slug: 'ahmet-usta',
    address: 'Kadıköy / İstanbul',
  });
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Sıra & Randevu Verileri
  const [currentServing, setCurrentServing] = useState<any>(null);
  const [queueList, setQueueList] = useState<any[]>([]);

  // Canlı Saat
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // İşletme ve Randevuları Çek
  useEffect(() => {
    async function load() {
      try {
        const res = await getBusinessBySlug(slug);
        if (res.success && res.data?.business) {
          setBusiness(res.data.business);

          const supabase = createClient();
          const todayStr = new Date().toISOString().split('T')[0];
          const { data: apts } = await supabase
            .from('appointments')
            .select('id, customer_name, start_time, status, services(name), staff(name)')
            .eq('business_id', res.data.business.id)
            .neq('status', 'canceled')
            .gte('start_time', `${todayStr}T00:00:00`)
            .lte('start_time', `${todayStr}T23:59:59`)
            .order('start_time', { ascending: true }) as any;

          if (apts && apts.length > 0) {
            const serving = apts.find((a: any) => a.status === 'confirmed');
            if (serving) {
              const startT = new Date(serving.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              setCurrentServing({
                id: serving.id,
                ticket: `S-${serving.id.slice(0, 3).toUpperCase()}`,
                customerName: serving.customer_name,
                service: (serving as any).services?.name || 'Hizmet',
                staff: (serving as any).staff?.name || 'Usta',
                startedAt: startT,
                estimatedRemainingMins: 15,
              });
            } else {
              setCurrentServing(null);
            }

            const queueItems = apts
              .filter((a: any) => a.id !== serving?.id)
              .map((a: any, idx: number) => ({
                id: a.id,
                ticket: `S-${a.id.slice(0, 3).toUpperCase()}`,
                customerName: a.customer_name,
                service: (a as any).services?.name || 'Hizmet',
                staff: (a as any).staff?.name || 'Müsait Usta',
                estimatedWaitMins: (idx + 1) * 20,
              }));

            setQueueList(queueItems);
          } else {
            setCurrentServing(null);
            setQueueList([]);
          }
        }
      } catch (e) {
        // fallback
      }
    }
    load();
  }, [slug]);

  // QR Kod Üretimi
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yerimhazir.com';
    const bookingUrl = `${origin}/${slug}`;
    QRCode.toDataURL(bookingUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#0284c7', light: '#ffffff' },
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [slug]);

  // Tam Ekran Kontrolü
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Zil Sesi Çalma
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // audio error
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* ÜST BAR (Başlık, Canlı Saat, Kontroller) */}
      <header className="flex items-center justify-between pb-6 border-b border-surface-200/20">
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}`}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
            title="Randevu Sayfasına Dön"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-2xl shadow-glow-primary">
            ✂️
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{business.name}</h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                CANLI BEKLEME EKRANI
              </span>
            </div>
            <p className="text-surface-400 text-sm mt-0.5">{business.address || 'YerimHazır Sıra Yönetim Sistemi'}</p>
          </div>
        </div>

        {/* Sağ Taraf: Canlı Dijital Saat & Kontroller */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-primary-300 drop-shadow-md">
              {time || '00:00:00'}
            </div>
            <div className="text-surface-400 text-xs sm:text-sm capitalize mt-0.5">{dateStr}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime();
              }}
              className="p-3 rounded-2xl bg-surface-100/80 border border-surface-200/40 text-surface-300 hover:text-white transition-all hover:bg-surface-200"
              title="Sesli Uyarıyı Aç/Kapat"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-primary-400" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-surface-100/80 border border-surface-200/40 text-surface-300 hover:text-white transition-all hover:bg-surface-200"
              title="Tam Ekran Modu"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ORTA ALAN: 2 Kolonlu TV Düzeni */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
        {/* SOL KOLON: ŞU AN HİZMETTE (CURRENT SERVING) */}
        <section className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#151c30] to-[#0d1222] border-2 border-primary-500/40 p-8 sm:p-10 shadow-glow-primary overflow-hidden">
            {/* Arka plan ışık efekti */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            {currentServing ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-4 py-1.5 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 text-sm font-bold uppercase tracking-wider">
                    ŞU AN KOLTUKTA / HİZMETTE
                  </span>
                  <span className="text-4xl font-black font-mono text-primary-400">{currentServing.ticket}</span>
                </div>

                <div className="space-y-4 my-6">
                  <div>
                    <span className="text-surface-400 text-xs uppercase tracking-wider">Müşteri</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">{currentServing.customerName}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-200/20">
                    <div>
                      <span className="text-surface-400 text-xs">Alınan Hizmet</span>
                      <div className="text-base sm:text-lg font-bold text-surface-100 mt-0.5">{currentServing.service}</div>
                    </div>
                    <div>
                      <span className="text-surface-400 text-xs">İlgilenen Usta</span>
                      <div className="text-base sm:text-lg font-bold text-primary-300 mt-0.5">{currentServing.staff}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-surface-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-400 text-sm">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>Tahmini Kalan Süre:</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ~{currentServing.estimatedRemainingMins} Dk
                  </span>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Koltuk Müsait</h3>
                  <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-xs mx-auto">
                    Şu an işlemde müşteri bulunmuyor. QR kodu okutarak hemen sıradaki randevunuzu oluşturabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SAĞ KOLON: SIRADAKİ MÜŞTERİLER (WAITING LIST) */}
        <section className="lg:col-span-7 flex flex-col justify-center">
          <div className="rounded-3xl bg-surface-100/40 border border-surface-200/20 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Users className="h-6 w-6 text-primary-400" />
                <h3 className="text-xl font-bold text-white">Sıradaki Müşteriler</h3>
              </div>
              <span className="text-xs text-surface-400">{queueList.length} Kişi Sırada Bekliyor</span>
            </div>

            <div className="space-y-3">
              {queueList.length === 0 ? (
                <div className="p-12 text-center text-surface-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <div className="font-bold text-white text-base">Bekleyen Sıra Yok</div>
                  <div className="text-xs text-surface-400 mt-1">Sıra beklemeden doğrudan randevu alabilirsiniz.</div>
                </div>
              ) : (
                queueList.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-2xl border transition-all',
                    index === 0
                      ? 'bg-primary-500/10 border-primary-500/30 shadow-soft'
                      : 'bg-surface-200/20 border-surface-200/20'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="h-10 w-10 rounded-xl bg-surface-200/40 flex items-center justify-center font-mono font-bold text-primary-300 text-sm">
                      {item.ticket}
                    </span>
                    <div>
                      <div className="font-bold text-base sm:text-lg text-white">{item.customerName}</div>
                      <div className="text-xs text-surface-400 flex items-center gap-2 mt-0.5">
                        <span>{item.service}</span>
                        <span>•</span>
                        <span className="text-primary-300">{item.staff}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-surface-400">Tahmini Bekleme</div>
                    <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-0.5">
                      ~{item.estimatedWaitMins} dk
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </section>
      </main>

      {/* ALT BAR (QR Kod & Canlı Bilgilendirme Marquee) */}
      <footer className="pt-6 border-t border-surface-200/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Randevu QR"
              className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-md shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-white/10 animate-pulse shrink-0" />
          )}
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              Sıranızı Cep Telefonunuzdan Takip Edin!
            </div>
            <p className="text-xs text-surface-400 mt-1 max-w-md">
              Kameranızı QR koda doğrultarak canlı sıranızı görebilir, sıranız yaklaşınca SMS bildirimi alabilirsiniz.
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right text-xs text-surface-500">
          <div>Gücünü <strong className="text-primary-400">YerimHazır</strong>'dan alır</div>
          <div className="text-[11px] text-surface-600 mt-0.5">Esnaf Randevu ve Sıra Yönetim Altyapısı</div>
        </div>
      </footer>
    </div>
  );
}
