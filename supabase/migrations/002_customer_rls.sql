-- ============================================================================
-- YerimHazır - Migration 002: Müşteri Randevu & Profil RLS Yetkileri
-- Müşterilerin kendi geçmiş hizmetlerini, ödemelerini ve randevularını görmesini sağlar.
-- ============================================================================

-- Appointments tablosuna müşteri okuma politikası
DROP POLICY IF EXISTS "Appointments: Musteri kendi randevularini okuma" ON appointments;
CREATE POLICY "Appointments: Musteri kendi randevularini okuma"
  ON appointments FOR SELECT
  USING (
    auth.uid() = customer_id
    OR (
      auth.jwt() ->> 'phone' IS NOT NULL 
      AND customer_phone = auth.jwt() ->> 'phone'
    )
    OR (
      auth.jwt() ->> 'email' IS NOT NULL 
      AND customer_email = auth.jwt() ->> 'email'
    )
  );

-- Müşterinin kendi randevusunu iptal edebilmesi için güncelleme politikası
DROP POLICY IF EXISTS "Appointments: Musteri kendi randevusunu iptal etme" ON appointments;
CREATE POLICY "Appointments: Musteri kendi randevusunu iptal etme"
  ON appointments FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR (
      auth.jwt() ->> 'phone' IS NOT NULL 
      AND customer_phone = auth.jwt() ->> 'phone'
    )
    OR (
      auth.jwt() ->> 'email' IS NOT NULL 
      AND customer_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    status = 'canceled'
  );
