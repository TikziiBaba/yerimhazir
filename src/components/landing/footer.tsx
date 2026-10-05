'use client';

import Link from 'next/link';
import { Calendar, Sparkles, Heart } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-surface-100 border-t border-surface-200/90 text-surface-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Açıklama (2 Kolon) */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-md">
                <Calendar className="h-5 w-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-gradient-hero">Yerim</span>
                <span>Hazır</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-surface-400 max-w-sm leading-relaxed">
              Türkiye&apos;nin yerel esnafları için tasarlanmış yeni nesil akıllı randevu ve canlı sıra yönetim platformu.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-50 border border-surface-200 text-xs font-semibold text-surface-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Tüm Sistemler Operasyonel (%99.98 Uptime)</span>
            </div>
          </div>

          {/* Kolon 1: Ürün */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Ürün</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/kesfet" className="text-primary-300 font-semibold hover:text-white transition-colors">Esnaf Keşfet ✨</Link></li>
              <li><a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a></li>
              <li><a href="#sektorler" className="hover:text-white transition-colors">Sektörel Çözümler</a></li>
              <li><a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a></li>
              <li><a href="#fiyatlandirma" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
              <li><a href="#sss" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
            </ul>
          </div>

          {/* Kolon 2: İşletmeler İçin */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">İşletmeler</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/isyeri-giris" className="text-primary-400 font-bold hover:text-primary-300 transition-colors">
                  İşyeri Girişi &rarr;
                </Link>
              </li>
              <li>
                <Link href="/isyeri-kayit" className="text-accent-400 font-bold hover:text-accent-300 transition-colors">
                  İşyerini Kaydet (14 Gün Ücretsiz)
                </Link>
              </li>
              <li><Link href="/giris" className="hover:text-white transition-colors">Bireysel Müşteri Girişi</Link></li>
              <li><Link href="/kayit" className="hover:text-white transition-colors">Müşteri Hesabı Aç</Link></li>
            </ul>
          </div>

          {/* Kolon 3: Yasal & İletişim */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim & Destek</Link></li>
            </ul>
          </div>
        </div>

        {/* Alt Çizgi & Telif */}
        <div className="mt-12 pt-8 border-t border-surface-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-surface-500">
          <p>© {new Date().getFullYear()} YerimHazır. Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-1.5">
            <span>Türkiye&apos;de esnaflarımız için sevgiyle geliştirildi</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
