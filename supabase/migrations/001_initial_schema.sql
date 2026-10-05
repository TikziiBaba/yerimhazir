-- ============================================================================
-- YerimHazır - Veritabanı Şeması (Migration 001 - %100 Tekrar Çalıştırılabilir / Idempotent)
-- Yerel esnaflar için randevu/sıra yönetim platformu
-- ============================================================================

-- UUID eklentisini etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TİPLERİ (Zaten varsa hata vermez)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('business_owner', 'customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE business_category AS ENUM ('barber', 'car_wash', 'sports_pitch', 'tattoo_studio', 'tailor', 'beauty_salon', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free_trial', 'starter', 'pro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'canceled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'deposit_paid', 'cash_on_delivery', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 1. PROFILES TABLOSU
-- Supabase Auth ile 1:1 ilişkili kullanıcı profilleri
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer';

-- Otomatik profil güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Yeni kullanıcı kaydında otomatik profil oluşturma (Güvenli, hata toleranslı)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  user_role_val public.user_role;
  full_name_val text;
  phone_val text;
BEGIN
  -- Güvenli rol tespiti (enum cast hatasını kesinlikle önler)
  IF NEW.raw_user_meta_data->>'role' = 'business_owner' THEN
    user_role_val := 'business_owner'::public.user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    user_role_val := 'admin'::public.user_role;
  ELSE
    user_role_val := 'customer'::public.user_role;
  END IF;

  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone);

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (NEW.id, full_name_val, phone_val, user_role_val)
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata çıksa dahi auth.users kaydının iptal edilmesini (Database error saving new user) önler!
    RAISE WARNING 'handle_new_user hatası: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. BUSINESSES TABLOSU
-- Esnaf dükkanları / işletmeler
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Temel bilgiler
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category business_category NOT NULL DEFAULT 'other',
  description TEXT,
  
  -- İletişim & Adres
  address TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  
  -- Medya (Cloudflare R2 linkleri)
  logo_url TEXT,
  cover_image_url TEXT,
  banner_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',

  -- Yetkili, Vergi & Onay Bilgileri
  owner_name TEXT,
  owner_phone TEXT,
  tax_number TEXT,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  
  -- Çalışma düzeni
  working_hours JSONB NOT NULL DEFAULT '{
    "monday":    {"open": "09:00", "close": "19:00", "breaks": [{"start": "12:30", "end": "13:30"}], "is_open": true},
    "tuesday":   {"open": "09:00", "close": "19:00", "breaks": [{"start": "12:30", "end": "13:30"}], "is_open": true},
    "wednesday": {"open": "09:00", "close": "19:00", "breaks": [{"start": "12:30", "end": "13:30"}], "is_open": true},
    "thursday":  {"open": "09:00", "close": "19:00", "breaks": [{"start": "12:30", "end": "13:30"}], "is_open": true},
    "friday":    {"open": "09:00", "close": "19:00", "breaks": [{"start": "12:30", "end": "13:30"}], "is_open": true},
    "saturday":  {"open": "09:00", "close": "17:00", "breaks": [], "is_open": true},
    "sunday":    {"open": null, "close": null, "breaks": [], "is_open": false}
  }'::jsonb,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_minutes IN (15, 30, 45, 60)),
  
  -- Abonelik
  subscription_tier subscription_tier NOT NULL DEFAULT 'free_trial',
  subscription_status subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  
  -- Meta
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS category business_category DEFAULT 'other';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tax_number TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{
  "monday":    {"open": "09:00", "close": "19:00", "breaks": [], "is_open": true},
  "tuesday":   {"open": "09:00", "close": "19:00", "breaks": [], "is_open": true},
  "wednesday": {"open": "09:00", "close": "19:00", "breaks": [], "is_open": true},
  "thursday":  {"open": "09:00", "close": "19:00", "breaks": [], "is_open": true},
  "friday":    {"open": "09:00", "close": "19:00", "breaks": [], "is_open": true},
  "saturday":  {"open": "09:00", "close": "17:00", "breaks": [], "is_open": true},
  "sunday":    {"open": null, "close": null, "breaks": [], "is_open": false}
}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 30;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free_trial';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'trialing';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_city_district ON businesses(city, district);
CREATE INDEX IF NOT EXISTS idx_businesses_approval_status ON businesses(approval_status);

DROP TRIGGER IF EXISTS set_businesses_updated_at ON businesses;
CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. SERVICES TABLOSU
-- İşletmenin sunduğu hizmetler (Saç Kesimi, Sakal Tıraşı vb.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Sıralama ve durum
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(business_id, is_active);

DROP TRIGGER IF EXISTS set_services_updated_at ON services;
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. STAFF TABLOSU
-- Personel / Ustalar / Koltuklar / Peronlar
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  title TEXT, -- 'Baş Berber', 'Kalfa', '1 Nolu Peron'
  avatar_url TEXT,
  
  -- Sıralama ve durum
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_staff_business ON staff(business_id);

DROP TRIGGER IF EXISTS set_staff_updated_at ON staff;
CREATE TRIGGER set_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. APPOINTMENTS TABLOSU
-- Randevu ve sıra kayıtları
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  
  -- Müşteri bilgileri (Üye olmadan da randevu alınabilir)
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Zamanlama
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Durum
  status appointment_status NOT NULL DEFAULT 'pending',
  cancellation_reason TEXT,
  
  -- Ödeme
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT, -- 'paytr', 'iyzico'
  payment_id TEXT,       -- Sağlayıcı işlem ID'si
  total_amount NUMERIC(10, 2),
  deposit_amount NUMERIC(10, 2),
  
  -- Notlar
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE RESTRICT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status appointment_status DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(business_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(business_id, status);

DROP TRIGGER IF EXISTS set_appointments_updated_at ON appointments;
CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Randevu çakışma kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('pending', 'confirmed') THEN
    IF EXISTS (
      SELECT 1 FROM appointments
      WHERE business_id = NEW.business_id
        AND staff_id = NEW.staff_id
        AND staff_id IS NOT NULL
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND status IN ('pending', 'confirmed')
        AND (
          (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
          (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
          (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
      RAISE EXCEPTION 'Bu zaman aralığında seçilen personel için başka bir randevu bulunmaktadır.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_appointment_overlap_trigger ON appointments;
CREATE TRIGGER check_appointment_overlap_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();

-- ============================================================================
-- 6. SUBSCRIPTIONS TABLOSU
-- Esnaf abonelikleri (PayTR entegrasyonu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  tier subscription_tier NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Fatura döngüsü
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- PayTR referansları
  paytr_sub_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tier subscription_tier NOT NULL DEFAULT 'starter';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status subscription_status NOT NULL DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paytr_sub_id TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. PAYMENT_HISTORY TABLOSU
-- Geçmiş ödeme kayıtları
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'deposit', 'one_time')),
  
  -- Ödeme sağlayıcı bilgileri
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  provider_response JSONB,
  
  -- Durum
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tablo önceden varsa eksik sütunları otomatik ekle
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS provider_response JSONB;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_payment_history_business ON payment_history(business_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
DROP POLICY IF EXISTS "Profiles: Genel okuma" ON profiles;
CREATE POLICY "Profiles: Genel okuma"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Profiles: Kendi profilini ekleme" ON profiles;
CREATE POLICY "Profiles: Kendi profilini ekleme"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Profiles: Kendi profilini güncelleme" ON profiles;
CREATE POLICY "Profiles: Kendi profilini güncelleme"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- BUSINESSES RLS
DROP POLICY IF EXISTS "Businesses: Aktif isletmeleri veya sahibi okuma" ON businesses;
CREATE POLICY "Businesses: Aktif isletmeleri veya sahibi okuma"
  ON businesses FOR SELECT
  USING (is_active = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Businesses: Sahibi olusturma" ON businesses;
CREATE POLICY "Businesses: Sahibi olusturma"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Businesses: Sahibi guncelleme" ON businesses;
CREATE POLICY "Businesses: Sahibi guncelleme"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Businesses: Sahibi silme" ON businesses;
CREATE POLICY "Businesses: Sahibi silme"
  ON businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- SERVICES RLS
DROP POLICY IF EXISTS "Services: Aktif hizmetleri genel okuma" ON services;
CREATE POLICY "Services: Aktif hizmetleri genel okuma"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id
      AND (b.is_active = true OR b.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Services: Isletme sahibi yonetim" ON services;
CREATE POLICY "Services: Isletme sahibi yonetim"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Services: Isletme sahibi guncelleme" ON services;
CREATE POLICY "Services: Isletme sahibi guncelleme"
  ON services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Services: Isletme sahibi silme" ON services;
CREATE POLICY "Services: Isletme sahibi silme"
  ON services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id
      AND b.owner_id = auth.uid()
    )
  );

-- STAFF RLS
DROP POLICY IF EXISTS "Staff: Aktif personeli genel okuma" ON staff;
CREATE POLICY "Staff: Aktif personeli genel okuma"
  ON staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = staff.business_id
      AND (b.is_active = true OR b.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Staff: Isletme sahibi yonetim" ON staff;
CREATE POLICY "Staff: Isletme sahibi yonetim"
  ON staff FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = staff.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff: Isletme sahibi guncelleme" ON staff;
CREATE POLICY "Staff: Isletme sahibi guncelleme"
  ON staff FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = staff.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff: Isletme sahibi silme" ON staff;
CREATE POLICY "Staff: Isletme sahibi silme"
  ON staff FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = staff.business_id
      AND b.owner_id = auth.uid()
    )
  );

-- APPOINTMENTS RLS
DROP POLICY IF EXISTS "Appointments: Isletme sahibi okuma" ON appointments;
CREATE POLICY "Appointments: Isletme sahibi okuma"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Appointments: Herkes randevu olusturabilir" ON appointments;
CREATE POLICY "Appointments: Herkes randevu olusturabilir"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id
      AND b.is_active = true
    )
  );

DROP POLICY IF EXISTS "Appointments: Isletme sahibi guncelleme" ON appointments;
CREATE POLICY "Appointments: Isletme sahibi guncelleme"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id
      AND b.owner_id = auth.uid()
    )
  );

-- SUBSCRIPTIONS RLS
DROP POLICY IF EXISTS "Subscriptions: Isletme sahibi okuma" ON subscriptions;
CREATE POLICY "Subscriptions: Isletme sahibi okuma"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = subscriptions.business_id
      AND b.owner_id = auth.uid()
    )
  );

-- PAYMENT_HISTORY RLS
DROP POLICY IF EXISTS "PaymentHistory: Isletme sahibi okuma" ON payment_history;
CREATE POLICY "PaymentHistory: Isletme sahibi okuma"
  ON payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = payment_history.business_id
      AND b.owner_id = auth.uid()
    )
  );

-- ANONİM KULLANICILAR İÇİN
DROP POLICY IF EXISTS "Appointments: Anonim randevu olusturma" ON appointments;
CREATE POLICY "Appointments: Anonim randevu olusturma"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id
      AND b.is_active = true
    )
  );

DROP POLICY IF EXISTS "Businesses: Anonim okuma" ON businesses;
CREATE POLICY "Businesses: Anonim okuma"
  ON businesses FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Services: Anonim okuma" ON services;
CREATE POLICY "Services: Anonim okuma"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Staff: Anonim okuma" ON staff;
CREATE POLICY "Staff: Anonim okuma"
  ON staff FOR SELECT
  TO anon
  USING (is_active = true);

-- YETKİLER
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;

-- ============================================================================
-- YARDIMCI FONKSİYONLAR
-- ============================================================================

CREATE OR REPLACE FUNCTION get_available_slots(
  p_business_id UUID,
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT NULL
)
RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ) AS $$
DECLARE
  v_day_name TEXT;
  v_open_time TIME;
  v_close_time TIME;
  v_slot_duration INTEGER;
  v_current_slot TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_break_start TIME;
  v_break_end TIME;
  v_break JSONB;
  v_working JSONB;
  v_is_open BOOLEAN;
BEGIN
  v_day_name := LOWER(TO_CHAR(p_date, 'fmday'));
  
  SELECT 
    b.working_hours->v_day_name,
    COALESCE(p_duration_minutes, b.slot_duration_minutes)
  INTO v_working, v_slot_duration
  FROM businesses b
  WHERE b.id = p_business_id;
  
  v_is_open := (v_working->>'is_open')::BOOLEAN;
  IF NOT v_is_open THEN
    RETURN;
  END IF;
  
  v_open_time := (v_working->>'open')::TIME;
  v_close_time := (v_working->>'close')::TIME;
  
  v_current_slot := p_date + v_open_time;
  
  WHILE v_current_slot + (v_slot_duration || ' minutes')::INTERVAL <= p_date + v_close_time LOOP
    v_slot_end := v_current_slot + (v_slot_duration || ' minutes')::INTERVAL;
    
    DECLARE
      v_in_break BOOLEAN := FALSE;
    BEGIN
      FOR v_break IN SELECT * FROM jsonb_array_elements(v_working->'breaks') LOOP
        v_break_start := (v_break->>'start')::TIME;
        v_break_end := (v_break->>'end')::TIME;
        
        IF v_current_slot::TIME < v_break_end AND (v_current_slot + (v_slot_duration || ' minutes')::INTERVAL)::TIME > v_break_start THEN
          v_in_break := TRUE;
          EXIT;
        END IF;
      END LOOP;
      
      IF NOT v_in_break THEN
        IF p_staff_id IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.staff_id = p_staff_id
              AND a.status IN ('pending', 'confirmed')
              AND a.start_time < v_slot_end
              AND a.end_time > v_current_slot
          ) THEN
            slot_start := v_current_slot;
            slot_end := v_slot_end;
            RETURN NEXT;
          END IF;
        ELSE
          slot_start := v_current_slot;
          slot_end := v_slot_end;
          RETURN NEXT;
        END IF;
      END IF;
    END;
    
    v_current_slot := v_current_slot + (v_slot_duration || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
