import { NextRequest, NextResponse } from 'next/server';

/**
 * Ödeme Webhook İşleyicisi
 * PayTR veya Iyzico'dan gelen ödeme bildirimlerini işler.
 * 
 * Bu endpoint /api/webhooks/payment altında olduğu için
 * middleware'deki auth kontrolünden muaftır.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ödeme sağlayıcı doğrulaması
    const provider = request.headers.get('x-payment-provider');
    
    switch (provider) {
      case 'paytr':
        return handlePayTRWebhook(body);
      case 'iyzico':
        return handleIyzicoWebhook(body);
      default:
        // Header yoksa body'den tespit et
        if (body.merchant_oid) {
          return handlePayTRWebhook(body);
        }
        if (body.token) {
          return handleIyzicoWebhook(body);
        }
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handlePayTRWebhook(body: Record<string, unknown>) {
  // PayTR webhook doğrulama ve işleme
  // const { merchant_oid, status, total_amount, hash } = body;
  
  // 1. Hash doğrulaması
  // 2. Ödeme durumu güncelleme
  // 3. Abonelik durumu güncelleme
  
  console.log('[PayTR Webhook]:', JSON.stringify(body));
  
  return NextResponse.json({ status: 'OK' });
}

async function handleIyzicoWebhook(body: Record<string, unknown>) {
  // Iyzico webhook doğrulama ve işleme
  
  console.log('[Iyzico Webhook]:', JSON.stringify(body));
  
  return NextResponse.json({ status: 'OK' });
}
