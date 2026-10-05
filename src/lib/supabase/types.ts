// ============================================================================
// YerimHazır - Supabase Veritabanı Tipleri
// Bu dosya veritabanı şemasına karşılık gelen katı TypeScript tiplerini içerir.
// Production'da `npx supabase gen types typescript` ile otomatik üretilmelidir.
// ============================================================================

export type UserRole = 'business_owner' | 'customer' | 'admin';
export type BusinessCategory = 'barber' | 'car_wash' | 'sports_pitch' | 'tattoo_studio' | 'tailor' | 'beauty_salon' | 'other';
export type SubscriptionTier = 'free_trial' | 'starter' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'deposit_paid' | 'cash_on_delivery' | 'refunded';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ========================
// Çalışma Saatleri JSONB Yapısı
// ========================

export type WorkingHoursBreak = {
  start: string; // "12:30"
  end: string;   // "13:30"
};

export type DaySchedule = {
  open: string | null;
  close: string | null;
  breaks: WorkingHoursBreak[];
  is_open: boolean;
};

export type WorkingHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export type DayOfWeek = keyof WorkingHours;

// ========================
// Tablo Satır Tipleri
// ========================

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  phone: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  banner_url: string | null;
  gallery_urls: string[];
  tax_number: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  working_hours: WorkingHours;
  slot_duration_minutes: number;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Staff = {
  id: string;
  business_id: string;
  name: string;
  title: string | null;
  avatar_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_user_id: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  business_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  payment_provider: string | null;
  payment_provider_subscription_id: string | null;
  starts_at: string;
  expires_at: string;
  canceled_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentHistory = {
  id: string;
  business_id: string;
  subscription_id: string | null;
  appointment_id: string | null;
  amount: number;
  currency: string;
  payment_type: 'subscription' | 'deposit' | 'one_time';
  provider: string;
  provider_transaction_id: string | null;
  provider_response: Record<string, unknown> | null;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
};

// ========================
// İlişkili / Genişletilmiş Tipler
// ========================

export type AppointmentWithRelations = Appointment & {
  service?: Service;
  staff?: Staff;
};

export type BusinessWithRelations = Business & {
  services?: Service[];
  staff?: Staff[];
};

// ========================
// Supabase Database Type (Supabase Client Generic)
// ========================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ========================
// Supabase Database Type (Supabase Client Generic)
// ========================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: Business;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          category: BusinessCategory;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          district?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          banner_url?: string | null;
          gallery_urls?: string[];
          tax_number?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          approval_status?: ApprovalStatus;
          rejection_reason?: string | null;
          working_hours?: WorkingHours;
          slot_duration_minutes?: number;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          category?: BusinessCategory;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          district?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          banner_url?: string | null;
          gallery_urls?: string[];
          tax_number?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          approval_status?: ApprovalStatus;
          rejection_reason?: string | null;
          working_hours?: WorkingHours;
          slot_duration_minutes?: number;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          price: number;
          duration_minutes?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: Staff;
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          title?: string | null;
          avatar_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          title?: string | null;
          avatar_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: {
          id?: string;
          business_id: string;
          service_id: string;
          staff_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          customer_user_id?: string | null;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          notes?: string | null;
          cancellation_reason?: string | null;
          total_amount?: number | null;
          deposit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          service_id?: string;
          staff_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          customer_user_id?: string | null;
          start_time?: string;
          end_time?: string;
          status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          notes?: string | null;
          cancellation_reason?: string | null;
          total_amount?: number | null;
          deposit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          id?: string;
          business_id: string;
          plan_name: string;
          amount: number;
          currency?: string;
          billing_period: 'monthly' | 'yearly';
          payment_provider?: string | null;
          payment_provider_subscription_id?: string | null;
          starts_at?: string;
          expires_at: string;
          canceled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          plan_name?: string;
          amount?: number;
          currency?: string;
          billing_period?: 'monthly' | 'yearly';
          payment_provider?: string | null;
          payment_provider_subscription_id?: string | null;
          starts_at?: string;
          expires_at?: string;
          canceled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_history: {
        Row: PaymentHistory;
        Insert: {
          id?: string;
          business_id: string;
          subscription_id?: string | null;
          appointment_id?: string | null;
          amount: number;
          currency?: string;
          payment_type: 'subscription' | 'deposit' | 'one_time';
          provider: string;
          provider_transaction_id?: string | null;
          provider_response?: Record<string, unknown> | null;
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          subscription_id?: string | null;
          appointment_id?: string | null;
          amount?: number;
          currency?: string;
          payment_type?: 'subscription' | 'deposit' | 'one_time';
          provider?: string;
          provider_transaction_id?: string | null;
          provider_response?: Record<string, unknown> | null;
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      business_category: BusinessCategory;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      appointment_status: AppointmentStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
