'use client';

import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Ahmet Usta Erkek Kuaförü',
    city: 'Kadıköy, İstanbul',
    avatar: 'AY',
    rating: 5,
    highlight: 'Telefon trafiği tamamen bitti, günde 4 fazladan saç kesiyorum.',
    quote:
      'Önceden koltuktayken sürekli telefon çalıyordu, "Abi 3 boş mu, 5\'e gelebilir miyim" diye konuşmaktan müşterinin saçına odaklanamıyordum. Şimdi müşteriler Instagram biyomdaki linke tıklıyor, boş saati seçip geliyor. WhatsApp otomatik hatırlattığı için randevusunu unutan kimse kalmadı.',
    stat: '+%35 Ciro Artışı',
  },
  {
    name: 'Büşra Karaca',
    role: 'Elit Güzellik & Saç Tasarım',
    city: 'Çankaya, Ankara',
    avatar: 'BK',
    rating: 5,
    highlight: 'No-show iptalleri yüzünden haftada kaybettiğimiz parayı kurtardık.',
    quote:
      'Lazer ve cilt bakımı seanslarında randevuya gelmeyen müşteriler çok büyük zarar yazıyordu. YerimHazır\'ın otomatik WhatsApp teyidi ve hatırlatmaları sayesinde randevusuna gelmeme oranı neredeyse sıfıra indi. Uzmanlarımızın takvimi artık tıkır tıkır işliyor.',
    stat: '%95 Daha Az İptal',
  },
  {
    name: 'Murat Şahin',
    role: 'Speed Detailing & Oto Yıkama',
    city: 'Bornova, İzmir',
    avatar: 'MŞ',
    rating: 5,
    highlight: 'Dükkandaki araba kuyruğu ve tartışmalar tamamen çözüldü.',
    quote:
      'Cumartesi günleri dükkanın önünde 10 araba kuyruk oluyordu. Müşteriler "Ben önce geldim" diye tartışıyordu. Camımıza QR kod koyduk, herkes randevusunu alıp peronunu seçiyor. Araç bittiğinde sistemden otomatik SMS gidiyor. Gerçekten esnafın dilinden anlayan bir yazılım.',
    stat: 'Kusursuz Peron Düzeni',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface-100/40 border-y border-surface-200/70 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-4 py-1.5 text-xs font-semibold text-emerald-300 tracking-wide mb-4 shadow-soft">
            ⭐️ Esnaf Deneyimleri
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Türkiye Genelinde 1,850+ Esnaf{' '}
            <span className="text-gradient-hero">Neden YerimHazır Diyor?</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-400">
            Kullanan dükkan sahiplerinin gerçek sonuçları ve tecrübeleri.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-3xl bg-surface-100/90 border border-surface-200 p-7 sm:p-8 shadow-soft card-hover flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Yıldızlar ve Stat Rozeti */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    {t.stat}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  &quot;{t.highlight}&quot;
                </h3>

                <p className="text-xs sm:text-sm text-surface-400 leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              {/* Kullanıcı Profili */}
              <div className="flex items-center gap-3 pt-4 border-t border-surface-200/60">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{t.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                  </div>
                  <div className="text-xs text-surface-400">{t.role} • {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
