'use server';

import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AppointmentStatus, BusinessCategory, WorkingHours, Database, ApprovalStatus } from '@/lib/supabase/types';
import { notificationService } from '@/lib/notifications';

type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

/**
 * İşletme bilgilerini slug ile getirme (Müşteri randevu sayfası için)
 */
export async function getBusinessBySlug(slug: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !business) {
      return { success: false, error: 'İşletme bulunamadı' };
    }

    const [{ data: services }, { data: staff }] = await Promise.all([
      supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('staff')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    return {
      success: true,
      data: {
        business,
        services: services || [],
        staff: staff || [],
      },
    };
  } catch (error) {
    return { success: false, error: 'İşletme yüklenirken bir hata oluştu.' };
  }
}

/**
 * Yeni randevu oluşturma (Müşteri tarafı - Auth gerekmez)
 */
export async function createAppointment(formData: {
  businessId: string;
  serviceId: string;
  staffId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  totalAmount?: number;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        business_id: formData.businessId,
        service_id: formData.serviceId,
        staff_id: formData.staffId || null,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        start_time: formData.startTime,
        end_time: formData.endTime,
        status: 'pending',
        payment_status: 'pending',
        total_amount: formData.totalAmount || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // SMS ve WhatsApp bildirimini tetikle
    try {
      const { data: bData } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', formData.businessId)
        .maybeSingle();

      const { data: sData } = await supabase
        .from('services')
        .select('name')
        .eq('id', formData.serviceId)
        .maybeSingle();

      await notificationService.send(
        {
          to: formData.customerPhone,
          template: 'appointment_created',
          data: {
            business_name: bData?.name || 'YerimHazır İşletmesi',
            service_name: sData?.name || 'Hizmet',
            date: formData.startTime.split('T')[0],
            time: formData.startTime.split('T')[1]?.substring(0, 5) || '',
          },
        },
        ['sms', 'whatsapp']
      );
    } catch (notifErr) {
      console.warn('[Bildirim Hatası]:', notifErr);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/randevular');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Randevu oluşturulurken bir hata oluştu.' };
  }
}

/**
 * Randevu durumunu güncelleme (Esnaf tarafı - Auth gerekir)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Durum değişikliği bildirimi
    try {
      const { data } = await (supabase.from('appointments') as any)
        .select('customer_phone, start_time, businesses(name), services(name)')
        .eq('id', appointmentId)
        .maybeSingle();

      const apt = data as any;
      if (apt?.customer_phone) {
        let template: any = null;
        if (status === 'confirmed') template = 'appointment_confirmed';
        else if (status === 'completed') template = 'appointment_completed';

        if (template) {
          await notificationService.send({
            to: apt.customer_phone,
            template,
            data: {
              business_name: (apt.businesses as any)?.name || 'İşletme',
              service_name: (apt.services as any)?.name || 'Hizmet',
              date: apt.start_time.split('T')[0],
              time: apt.start_time.split('T')[1]?.substring(0, 5) || '',
            },
          });
        }
      }
    } catch (e) {
      console.warn('[Durum Bildirimi Hatası]:', e);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/randevular');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Durum güncellenirken bir hata oluştu.' };
  }
}

/**
 * Presigned URL ile R2'ye dosya yükleme
 */
export async function getUploadUrl(
  businessId: string,
  type: 'logo' | 'cover' | 'gallery',
  filename: string,
  contentType: string
) {
  try {
    const { getPresignedUploadUrl, generateStorageKey } = await import('@/lib/storage');
    const key = generateStorageKey(businessId, type, filename);
    const result = await getPresignedUploadUrl(key, contentType);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: 'Yükleme URL\'i oluşturulamadı.' };
  }
}


/**
 * İşletme bilgilerini güncelleme
 */
export async function updateBusiness(
  businessId: string,
  data: BusinessUpdate
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('businesses')
      .update(data)
      .eq('id', businessId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/ayarlar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'İşletme bilgileri güncellenirken bir hata oluştu.' };
  }
}

/**
 * Randevu iptal etme (İptal nedeni ile birlikte)
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'canceled',
        cancellation_reason: reason || null,
      })
      .eq('id', appointmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    // İptal bildirimi gönder
    try {
      const { data } = await (supabase.from('appointments') as any)
        .select('customer_phone, start_time, businesses(name, slug)')
        .eq('id', appointmentId)
        .maybeSingle();

      const apt = data as any;
      if (apt?.customer_phone) {
        await notificationService.send({
          to: apt.customer_phone,
          template: 'appointment_canceled',
          data: {
            business_name: (apt.businesses as any)?.name || 'İşletme',
            date: apt.start_time.split('T')[0],
            time: apt.start_time.split('T')[1]?.substring(0, 5) || '',
            booking_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://yerimhazir.com'}/${(apt.businesses as any)?.slug || ''}`,
          },
        });
      }
    } catch (e) {
      console.warn('[İptal Bildirimi Hatası]:', e);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/randevular');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Randevu iptal edilirken bir hata oluştu.' };
  }
}

/**
 * Hizmet ekleme
 */
export async function createService(
  businessId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        business_id: businessId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration_minutes: data.duration_minutes,
        is_active: true,
        sort_order: 99,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/hizmetler');
    return { success: true, data: service };
  } catch (error) {
    return { success: false, error: 'Hizmet eklenirken bir hata oluştu.' };
  }
}

/**
 * Hizmet güncelleme
 */
export async function updateService(
  serviceId: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    duration_minutes?: number;
    is_active?: boolean;
    sort_order?: number;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('services')
      .update(data)
      .eq('id', serviceId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/hizmetler');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Hizmet güncellenirken bir hata oluştu.' };
  }
}

/**
 * Hizmet silme
 */
export async function deleteService(serviceId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/hizmetler');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Hizmet silinirken bir hata oluştu.' };
  }
}

/**
 * Personel ekleme
 */
export async function createStaff(
  businessId: string,
  data: {
    name: string;
    title?: string;
    avatar_url?: string | null;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        business_id: businessId,
        name: data.name,
        title: data.title || null,
        avatar_url: data.avatar_url || null,
        is_active: true,
        sort_order: 99,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/personel');
    return { success: true, data: staff };
  } catch (error) {
    return { success: false, error: 'Personel eklenirken bir hata oluştu.' };
  }
}

/**
 * Personel güncelleme
 */
export async function updateStaff(
  staffId: string,
  data: {
    name?: string;
    title?: string | null;
    avatar_url?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('staff')
      .update(data)
      .eq('id', staffId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/personel');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Personel güncellenirken bir hata oluştu.' };
  }
}

/**
 * Personel silme
 */
export async function deleteStaff(staffId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/personel');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Personel silinirken bir hata oluştu.' };
  }
}

/**
 * İşyeri Kayıt Server Action (Admin Client ile güvenli kayıt)
 */
export async function registerBusinessAction(payload: {
  userId: string;
  businessName: string;
  category: BusinessCategory;
  description?: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  taxNumber?: string;
  ownerName: string;
  ownerPhone: string;
  workingHours: WorkingHours;
  slotDuration: number;
  logoUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
}) {
  try {
    const admin = await createAdminSupabaseClient();
    const slug = payload.businessName
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    // 1. Profil kaydının varlığını kesinleştir (Trigger hatası olsa bile RLS/Foreign Key patlamasın)
    await admin.from('profiles').upsert({
      id: payload.userId,
      full_name: payload.ownerName,
      phone: payload.ownerPhone,
      role: 'business_owner',
    });

    // 2. İşletmeyi oluştur
    const { data, error } = await admin
      .from('businesses')
      .insert({
        owner_id: payload.userId,
        name: payload.businessName,
        slug: `${slug}-${Date.now().toString(36)}`,
        category: payload.category,
        description: payload.description || null,
        address: payload.address,
        city: payload.city,
        district: payload.district,
        phone: payload.phone,
        tax_number: payload.taxNumber || null,
        owner_name: payload.ownerName,
        owner_phone: payload.ownerPhone,
        working_hours: payload.workingHours,
        slot_duration_minutes: payload.slotDuration,
        logo_url: payload.logoUrl || null,
        banner_url: payload.bannerUrl || null,
        gallery_urls: payload.galleryUrls || [],
        approval_status: 'pending',
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'İşletme kaydedilirken sunucu hatası oluştu.';
    return { success: false, error: msg };
  }
}

/**
 * Sunucu tarafında admin yetkisiyle kullanıcı hesabı oluşturma
 * "Database error saving new user" ve e-posta onay engellerini tamamen aşar.
 */
export async function signUpBusinessUserAction(account: {
  email: string;
  password: string;
  ownerName: string;
  ownerPhone: string;
}) {
  try {
    const admin = await createAdminSupabaseClient();

    // 1. Kullanıcıyı oluştur ve otomatik onayla
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: account.email.trim(),
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.ownerName,
        phone: account.ownerPhone,
        role: 'business_owner',
      },
    });

    if (createError) {
      if (createError.message.toLowerCase().includes('already')) {
        return { success: false, code: 'ALREADY_REGISTERED', error: createError.message };
      }
      return { success: false, error: createError.message };
    }

    if (userData.user) {
      // 2. Profil tablosuna güvenle yaz
      await admin.from('profiles').upsert({
        id: userData.user.id,
        full_name: account.ownerName,
        phone: account.ownerPhone,
        role: 'business_owner',
      });
    }

    return { success: true, userId: userData.user?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kullanıcı oluşturulurken bir hata oluştu.';
    return { success: false, error: msg };
  }
}

/**
 * Müşteri Randevularını ve Geçmiş Hizmetlerini Getirme
 */
export async function getCustomerAppointmentsAction() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Oturum açılmamış', appointments: [] };
    }

    const phone = user.user_metadata?.phone;
    const email = user.email;

    // Supabase appointments tablosundan sorgula
    let query = supabase
      .from('appointments')
      .select('*, businesses(name, slug, category, address, phone), services(name, price, duration_minutes), staff(name)')
      .order('start_time', { ascending: false });

    if (phone && email) {
      query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else if (phone) {
      query = query.eq('customer_phone', phone);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message, appointments: [] };
    }

    return { success: true, appointments: data || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Randevular alınırken bir hata oluştu.';
    return { success: false, error: msg, appointments: [] };
  }
}

/**
 * Müşteri Profil Bilgilerini Güncelleme
 */
export async function updateCustomerProfileAction(payload: {
  fullName: string;
  phone: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Oturum açılmamış.' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: payload.fullName,
        phone: payload.phone,
      })
      .eq('id', user.id);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Auth metadata'yı da güncelle
    await supabase.auth.updateUser({
      data: {
        full_name: payload.fullName,
        phone: payload.phone,
      },
    });

    revalidatePath('/hesabim');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Profil güncellenirken hata oluştu.';
    return { success: false, error: msg };
  }
}




/**
 * Super Admin: Tum platform verilerini getirme
 */
export async function getAdminPlatformDataAction() {
  try {
    const adminClient = await createAdminSupabaseClient();

    const { data: businesses } = await adminClient
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: appointments } = await adminClient
      .from('appointments')
      .select('*, businesses(name), services(name), staff(name)')
      .order('start_time', { ascending: false })
      .limit(100);

    const { count: usersCount } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const totalBusinesses = businesses?.length || 0;
    const pendingBusinesses = businesses?.filter((b) => b.approval_status === 'pending').length || 0;
    const approvedBusinesses = businesses?.filter((b) => b.approval_status === 'approved').length || 0;
    const totalAppointments = appointments?.length || 0;
    const totalRevenue = (appointments || [])
      .filter((a: any) => a.payment_status === 'paid' || a.status === 'completed')
      .reduce((sum: number, a: any) => sum + (Number(a.total_amount) || 0), 0);

    return {
      success: true,
      data: {
        businesses: (businesses || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          ownerName: b.owner_name || 'İşletme Yetkilisi',
          category: b.category,
          city: b.city || 'İstanbul',
          district: b.district || '',
          phone: b.phone || '-',
          email: b.owner_phone ? '' : '-',
          slug: b.slug,
          plan: (b.subscription_tier || 'starter') as 'starter' | 'pro' | 'enterprise',
          approvalStatus: (b.approval_status || 'pending') as 'pending' | 'approved' | 'rejected' | 'suspended',
          appointmentCount: 0,
          monthlyRevenue: 0,
          joinedAt: b.created_at ? new Date(b.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Yeni',
          taxNumber: b.tax_number || undefined,
        })),
        appointments: (appointments || []).map((a: any) => ({
          id: a.id,
          businessName: a.businesses?.name || 'İşletme',
          customerName: a.customer_name || 'Misafir',
          customerPhone: a.customer_phone || '-',
          service: a.services?.name || 'Hizmet',
          staffName: a.staff?.name || 'Personel',
          time: a.start_time ? new Date(a.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '10:00',
          date: a.start_time ? new Date(a.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Bugün',
          amount: Number(a.total_amount) || 0,
          status: a.status || 'pending',
          channel: 'online' as const,
        })),
        stats: {
          totalBusinesses,
          pendingBusinesses,
          approvedBusinesses,
          totalAppointments,
          totalRevenue,
          totalUsers: usersCount || 0,
        },
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Admin verileri yüklenemedi.';
    return { success: false, error: msg };
  }
}

/**
 * Super Admin: Isletme onay durumunu guncelleme
 */
export async function updateBusinessApprovalStatusAction(payload: {
  businessId: string;
  status: 'approved' | 'rejected' | 'suspended' | 'pending';
}) {
  try {
    const adminClient = await createAdminSupabaseClient();
    const isActive = payload.status === 'approved';
    const dbStatus: ApprovalStatus = payload.status === 'suspended' ? 'rejected' : payload.status;

    const { error } = await adminClient
      .from('businesses')
      .update({
        approval_status: dbStatus,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.businessId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/kesfet');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Durum güncellenirken hata oluştu.';
    return { success: false, error: msg };
  }
}
