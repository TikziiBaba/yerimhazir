/**
 * Soyutlanmış (abstracted) bildirim servisi katmanı.
 * WhatsApp Business API ve Netgsm SMS entegrasyonuna hazır.
 * Şu an mock olarak çalışır, production'da sağlayıcı (provider) eklenecek.
 */

export interface NotificationPayload {
  to: string; // Telefon numarası
  template: NotificationTemplate;
  data: Record<string, string>;
}

export type NotificationTemplate =
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_canceled'
  | 'appointment_reminder'
  | 'appointment_completed';

export type NotificationChannel = 'sms' | 'whatsapp' | 'email';

interface NotificationProvider {
  send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string }>;
}

// ========================
// Mock SMS Provider (Geliştirme Ortamı)
// ========================

class MockSMSProvider implements NotificationProvider {
  async send(payload: NotificationPayload) {
    const message = getTemplateMessage(payload.template, payload.data);
    console.log(`[MOCK SMS] To: ${payload.to} | Message: ${message}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

// ========================
// Netgsm SMS Provider (Production)
// ========================

class NetgsmProvider implements NotificationProvider {
  async send(payload: NotificationPayload) {
    const message = getTemplateMessage(payload.template, payload.data);
    const usercode = process.env.NETGSM_USERCODE;
    const password = process.env.NETGSM_PASSWORD;
    const header = process.env.NETGSM_SENDER || 'YERIMHAZIR';

    if (usercode && password) {
      try {
        const cleanGsm = payload.to.replace(/\D/g, '').replace(/^0/, '');
        const params = new URLSearchParams({
          usercode,
          password,
          gsmno: cleanGsm,
          message,
          msgheader: header,
          dil: 'TR',
        });

        const response = await fetch(`https://api.netgsm.com.tr/sms/send/get/?${params.toString()}`, {
          method: 'GET',
        });
        const resultText = await response.text();
        const isSuccess = resultText.startsWith('00') || resultText.startsWith('01') || resultText.startsWith('02');
        console.log(`[NETGSM Response]: ${resultText}`);
        return { success: isSuccess, messageId: resultText };
      } catch (err) {
        console.error('[NETGSM Error]:', err);
      }
    }
    
    console.log(`[NETGSM SMS Fallback/Mock] To: ${payload.to} | Message: ${message}`);
    return { success: true, messageId: `netgsm-${Date.now()}` };
  }
}

// ========================
// WhatsApp Business API Provider (Production)
// ========================

class WhatsAppProvider implements NotificationProvider {
  async send(payload: NotificationPayload) {
    const message = getTemplateMessage(payload.template, payload.data);
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (accessToken && phoneId) {
      try {
        let cleanPhone = payload.to.replace(/\D/g, '');
        if (!cleanPhone.startsWith('90')) {
          cleanPhone = '90' + cleanPhone.replace(/^0/, '');
        }

        const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message },
          }),
        });
        const data = await res.json();
        return { success: res.ok, messageId: data?.messages?.[0]?.id };
      } catch (err) {
        console.error('[WhatsApp API Error]:', err);
      }
    }
    
    console.log(`[WHATSAPP Mock] To: ${payload.to} | Message: ${message}`);
    return { success: true, messageId: `wa-${Date.now()}` };
  }
}

/**
 * Esnafın tarayıcıdan tek tıkla müşteriye WhatsApp web üzerinden mesaj atabilmesi için link üretici
 */
export function getWhatsAppDirectLink(phone: string, text: string): string {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '90' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('90')) {
    cleanPhone = '90' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// ========================
// Template Mesajları
// ========================

function getTemplateMessage(template: NotificationTemplate, data: Record<string, string>): string {
  const templates: Record<NotificationTemplate, string> = {
    appointment_created: `🗓️ Randevunuz oluşturuldu!\n\n${data.business_name}\n📋 ${data.service_name}\n📅 ${data.date} saat ${data.time}\n\nİyi günler dileriz! - YerimHazır`,
    appointment_confirmed: `✅ Randevunuz onaylandı!\n\n${data.business_name}\n📋 ${data.service_name}\n📅 ${data.date} saat ${data.time}\n\nSizi bekliyoruz!`,
    appointment_canceled: `❌ Randevunuz iptal edildi.\n\n${data.business_name}\n📅 ${data.date} saat ${data.time}\n\nYeni randevu almak için: ${data.booking_url}`,
    appointment_reminder: `⏰ Hatırlatma: Yarın randevunuz var!\n\n${data.business_name}\n📋 ${data.service_name}\n📅 ${data.date} saat ${data.time}\n\nSizi bekliyoruz!`,
    appointment_completed: `🎉 Teşekkürler!\n\n${data.business_name}'ı ziyaret ettiğiniz için teşekkürler.\nTekrar görüşmek üzere! ⭐`,
  };

  return templates[template] || '';
}

// ========================
// Bildirim Servisi (Façade)
// ========================

class NotificationService {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();

  constructor() {
    // Development ortamında mock provider kullan
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      this.providers.set('sms', new MockSMSProvider());
      this.providers.set('whatsapp', new MockSMSProvider());
    } else {
      // Production provider'ları
      if (process.env.NETGSM_API_KEY) {
        this.providers.set('sms', new NetgsmProvider());
      }
      if (process.env.WHATSAPP_ACCESS_TOKEN) {
        this.providers.set('whatsapp', new WhatsAppProvider());
      }
    }
  }

  async send(
    payload: NotificationPayload,
    channels: NotificationChannel[] = ['sms']
  ): Promise<{ channel: string; success: boolean; messageId?: string }[]> {
    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        const provider = this.providers.get(channel);
        if (!provider) {
          return { channel, success: false, error: `Provider "${channel}" not configured` };
        }
        const result = await provider.send(payload);
        return { channel, ...result };
      })
    );

    return results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { channel: 'unknown', success: false }
    );
  }
}

// Singleton export
export const notificationService = new NotificationService();
