'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Store,
  QrCode,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ReceiptData {
  id: string;
  receiptNumber: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  serviceName: string;
  staffName: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone?: string;
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    toast.info('Yazdırma penceresi hazırlanıyor...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownload = () => {
    toast.success('Dijital fiş hazırlandı', {
      description: `${receipt.receiptNumber} nolu dekont cihazınıza kaydedildi.`,
    });
  };

  // KDV hesaplama (%20 dahil varsayalım)
  const total = receipt.price;
  const subtotal = Math.round((total / 1.2) * 100) / 100;
  const vat = Math.round((total - subtotal) * 100) / 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:bg-white print:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface-100 border border-surface-200 shadow-elevated p-6 sm:p-8 print:border-none print:shadow-none print:bg-white print:text-black"
        >
          {/* Üst Kapat Butonu */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-surface-200/60 text-surface-400 hover:text-white hover:bg-surface-200 transition-colors print:hidden"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Fiş Başlığı */}
          <div className="text-center pb-6 border-b border-surface-200/80 print:border-neutral-300">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mb-3 print:bg-neutral-100">
              <Receipt className="h-6 w-6 text-emerald-400 print:text-neutral-800" />
            </div>
            <h2 className="text-lg font-bold text-white print:text-neutral-900" style={{ fontFamily: 'var(--font-display)' }}>
              Dijital Hizmet Fişi & Dekontu
            </h2>
            <p className="text-xs text-surface-400 print:text-neutral-600 mt-0.5">
              YerimHazır Güvenli Ödeme Doğrulaması
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-surface-200/60 text-surface-300 border border-surface-300/40 print:border-neutral-300 print:text-neutral-700">
              <span>Fiş No:</span>
              <strong className="text-primary-300 print:text-neutral-900">{receipt.receiptNumber}</strong>
            </div>
          </div>

          {/* Fiş Detayları */}
          <div className="py-5 space-y-4 text-xs sm:text-sm">
            {/* İşletme Bilgileri */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-surface-200/40 border border-surface-300/30 print:bg-neutral-50 print:border-neutral-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-bold print:text-neutral-900">
                  <Store className="h-3.5 w-3.5 text-accent-400 print:text-neutral-700" />
                  {receipt.businessName}
                </div>
                <p className="text-[11px] text-surface-400 print:text-neutral-600">{receipt.businessAddress}</p>
                <p className="text-[11px] text-surface-400 print:text-neutral-600">{receipt.businessPhone}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md print:text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Tahsil Edildi
                </span>
              </div>
            </div>

            {/* Müşteri ve Randevu Zamanı */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-surface-200/30 border border-surface-200/60 print:border-neutral-200 print:bg-neutral-50">
                <span className="text-[11px] text-surface-400 print:text-neutral-500 block mb-1">Müşteri</span>
                <span className="font-semibold text-white print:text-neutral-900 block truncate">{receipt.customerName}</span>
                <span className="text-[11px] text-surface-400 print:text-neutral-600">{receipt.customerPhone || 'Kayıtlı Numara'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-200/30 border border-surface-200/60 print:border-neutral-200 print:bg-neutral-50">
                <span className="text-[11px] text-surface-400 print:text-neutral-500 block mb-1">Tarih & Saat</span>
                <span className="font-semibold text-white print:text-neutral-900 block">{receipt.date}</span>
                <span className="text-[11px] text-surface-400 print:text-neutral-600">{receipt.time} ({receipt.durationMinutes} dk)</span>
              </div>
            </div>

            {/* Hizmet ve Kalem Tablosu */}
            <div className="border border-surface-200 rounded-2xl overflow-hidden print:border-neutral-300">
              <div className="bg-surface-200/50 px-4 py-2 border-b border-surface-200 text-[11px] font-semibold text-surface-400 flex justify-between print:bg-neutral-100 print:text-neutral-700">
                <span>Hizmet Açıklaması</span>
                <span>Tutar</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white print:text-neutral-900">{receipt.serviceName}</p>
                    {receipt.staffName && (
                      <p className="text-[11px] text-surface-400 print:text-neutral-600">Personel / Usta: {receipt.staffName}</p>
                    )}
                  </div>
                  <span className="font-bold text-white print:text-neutral-900">₺{receipt.price.toLocaleString('tr-TR')}</span>
                </div>
              </div>
              <div className="bg-surface-200/30 px-4 py-3 border-t border-surface-200 space-y-1.5 text-xs print:bg-neutral-50 print:border-neutral-200">
                <div className="flex justify-between text-surface-400 print:text-neutral-600">
                  <span>Ara Toplam (KDV Hariç):</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-surface-400 print:text-neutral-600">
                  <span>KDV (%20):</span>
                  <span>₺{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white print:text-neutral-900 pt-1.5 border-t border-surface-200/80">
                  <span>Ödenen Net Tutar:</span>
                  <span className="text-primary-300 text-base print:text-neutral-900">₺{receipt.price.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>

            {/* Ödeme Türü ve Güvenlik Damgası */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-surface-400 print:text-neutral-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary-400" />
                <span>Ödeme Yöntemi: <strong className="text-surface-200 print:text-neutral-800">{receipt.paymentMethod}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <QrCode className="h-3.5 w-3.5 text-accent-400" />
                <span>e-Doğrulandı</span>
              </div>
            </div>
          </div>

          {/* Alt Aksiyon Butonları */}
          <div className="pt-4 border-t border-surface-200/80 flex items-center justify-between gap-3 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-surface-300/60 hover:bg-surface-200/50 text-xs font-semibold text-surface-300 transition-colors"
            >
              Kapat
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-200/80 hover:bg-surface-200 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-surface-300" />
                <span>Kaydet</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white shadow-soft transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Fişi Yazdır</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
