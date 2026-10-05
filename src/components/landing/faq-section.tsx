'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'Kullanmak için bilgisayar veya özel bir cihaz gerekir mi?',
    a: 'Hayır, kesinlikle gerekmez. YerimHazır %100 mobil uyumludur. Dükkanınızdaki randevuları, canlı sırayı ve müşteri takvimini doğrudan akıllı telefonunuzdan kolayca yönetebilirsiniz.',
  },
  {
    q: 'Müşterilerimin randevu almak için uygulama indirmesi gerekir mi?',
    a: 'Hayır! Müşterilerinizin hiçbir uygulama indirmesine veya şifre oluşturmasına gerek yoktur. Paylaştığınız web linkine (yerimhazir.com/dukkaniniz) tıklayarak veya camınızdaki QR kodu okutarak 15 saniyede randevu oluşturabilirler.',
  },
  {
    q: '14 günlük ücretsiz deneme için kredi kartı gerekiyor mu?',
    a: 'Hayır. Kayıt olurken herhangi bir kredi kartı bilgisi istenmez. 14 gün boyunca tüm profesyonel özellikleri sınırsız deneyebilirsiniz. Memnun kalırsanız sürenin sonunda paket seçip devam edebilirsiniz.',
  },
  {
    q: 'Otomatik WhatsApp ve SMS hatırlatması nasıl çalışıyor?',
    a: 'Müşteri randevu aldığında anında onay mesajı iletilir. Randevudan 24 saat ve 2 saat önce otomatik hatırlatma gider. Böylece "unuttum" bahanesiyle boş kalan koltuklar ve gelir kayıpları engellenir.',
  },
  {
    q: 'Dükkandaki Canlı Sıra ve QR Masa Kartı nedir?',
    a: 'Panelinizden dükkanınıza özel hazırlanan QR kodlu masa veya cam kartını tek tıkla yazdırabilirsiniz. Randevusuz gelen müşteriler bu kodu okutarak sırasını alır, sırasının kaçıncı olduğunu telefonundan canlı izler.',
  },
  {
    q: 'İstediğim zaman aboneliğimi iptal edebilir miyim?',
    a: 'Evet, hiçbir taahhüt, sözleşme veya ceza yoktur. Dilediğiniz an tek tıkla üyeliğinizi sonlandırabilirsiniz.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="sss" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 px-4 py-1.5 text-xs font-semibold text-primary-300 tracking-wide mb-4 shadow-soft">
            <HelpCircle className="h-3.5 w-3.5" />
            Aklınıza Takılanlar
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sıkça Sorulan <span className="text-gradient-hero">Sorular</span>
          </h2>
          <p className="mt-3 text-base text-surface-400">
            YerimHazır hakkında merak ettiğiniz tüm detaylar.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-surface-100/90 border border-surface-200/90 overflow-hidden shadow-soft transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:text-primary-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-surface-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-surface-400 leading-relaxed border-t border-surface-200/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
