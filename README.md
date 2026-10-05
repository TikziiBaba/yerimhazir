# YerimHazır 🚀

**YerimHazır**, yerel esnaflar (Berber/Kuaför, Oto Yıkama, Halı Saha, Dövme Stüdyosu, Terzi vb.) için geliştirilmiş, hafif, ultra hızlı, mobil öncelikli (Mobile-First PWA) ve modern bir randevu ve sıra yönetim mikro-SaaS platformudur.

---

## 🌟 Öne Çıkan Özellikler

- **📱 Mobile-First PWA Deneyimi**: Esnaf ve müşteriler için uygulama mağazasına ihtiyaç duymadan ana ekrana eklenebilir, native hissettiren akıcı arayüz.
- **⚡ 3 Adımda Kayıtsız Randevu**: Müşteriler üye olmak zorunda kalmadan `yerimhazir.com/[isletme-adi]` linkinden 3 adımda saniyeler içinde randevu alır.
- **📊 Esnaf Kontrol Paneli**: Günlük randevu takvimi, durum güncellemeleri (Onaylandı, Tamamlandı, İptal), ciro istatistikleri ve işletme ayarları.
- **🔒 Güvenli Altyapı**: Supabase Auth + PostgreSQL Row Level Security (RLS) ile çok kiracılı (multi-tenant) veri izolasyonu.
- **☁️ Cloudflare R2 Medya Yönetimi**: AWS S3 uyumlu SDK ve tarayıcı tarafı WebP görsel sıkıştırma ile logo, kapak ve galeri fotoğrafları yükleme.
- **💳 Esnek Ödeme Entegrasyonu**: PayTR ve Iyzico için webhook tabanlı abonelik ve tek seferlik kapora tahsilat mimarisi.
- **💬 Soyutlanmış Bildirim Servisi**: WhatsApp Business Cloud API ve Netgsm SMS servisleri için tek merkezden yönetilebilir adaptör mimarisi.

---

## 🛠️ Teknoloji Yığını

| Alan | Teknoloji | Açıklama |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) | Server Actions, SSR, Dynamic Routing |
| **Dil** | TypeScript | Uçtan uca tip güvenliği |
| **Stil & Tasarım** | Tailwind CSS v4, Lucide Icons, Framer Motion | Mikro animasyonlar, modern cam efektleri (glassmorphism) |
| **Veritabanı & Auth** | [Supabase](https://supabase.com/) | PostgreSQL, Auth, Row Level Security (RLS), Triggers |
| **Depolama** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | S3-compatible Client, Presigned URLs, WebP Client Compression |
| **Ödeme** | PayTR / Iyzico | Webhook tabanlı ödeme ve abonelik yönetimi |
| **Bildirim** | Netgsm SMS & WhatsApp Cloud API | Abstracted Notification Provider |

---

## 📂 Proje Dizin Yapısı

```
yerimhazir/
├── public/                 # Statik dosyalar, PWA manifest.json
├── src/
│   ├── app/
│   │   ├── [slug]/         # Müşteri randevu akışı (3 adımlı sihirbaz)
│   │   ├── api/webhooks/   # PayTR & Iyzico ödeme bildirim webhook'ları
│   │   ├── dashboard/      # Esnaf yönetim paneli (takvim, randevular, ayarlar)
│   │   ├── giris/          # Giriş yap sayfası
│   │   ├── kayit/          # 14 günlük deneme kayıt sayfası
│   │   ├── actions.ts      # Server Actions (Randevu oluşturma, durum güncelleme)
│   │   ├── layout.tsx      # Kök layout, SEO meta verileri, Google Fonts
│   │   └── page.tsx        # Modern SaaS Landing Page (Hero, Özellikler, Fiyatlandırma)
│   ├── components/
│   │   └── landing/        # Header, Hero, Features, HowItWorks, Pricing, Footer
│   ├── lib/
│   │   ├── supabase/       # Server, Browser client ve katı Database tipleri
│   │   ├── constants.ts    # Esnaf kategorileri, durum etiketleri, fiyat paketleri
│   │   ├── notifications.ts# SMS & WhatsApp bildirim adaptörleri
│   │   ├── storage.ts      # Cloudflare R2 S3 SDK ve Presigned URL üretici
│   │   └── upload.ts       # Canvas tabanlı istemci görsel sıkıştırma (WebP)
│   └── proxy.ts            # Next.js 16 Proxy (Auth & Session koruması)
└── supabase/
    └── migrations/         # PostgreSQL DDL, RLS kuralları, Trigger ve Fonksiyonlar
```

---

## 🚀 Başlangıç ve Kurulum

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone <repo-url>
cd yerimhazir
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.example .env.local
```

Gerekli anahtarları doldurun:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`
- `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER`

### 3. Veritabanı Şemasını Uygulayın

Supabase SQL Editöründe veya Supabase CLI ile `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın:
- Tüm tablolar (`profiles`, `businesses`, `services`, `staff`, `appointments`, `subscriptions`, `payment_history`)
- Row Level Security (RLS) politikaları
- `handle_new_user` ve `set_updated_at` tetikleyicileri
- `get_available_slots` randevu çakışma önleyici SQL fonksiyonu

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

### 5. Production Build Doğrulama

```bash
npm run build
```

---

## 📄 Lisans

Bu proje özel mülkiyet altındadır. Tüm hakları saklıdır.
