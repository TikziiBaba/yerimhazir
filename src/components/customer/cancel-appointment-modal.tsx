'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Calendar, Clock, Store } from 'lucide-react';

interface CancelAppointmentModalProps {
  item: {
    id: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
  } | null;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}

const CANCELLATION_REASONS = [
  'Programım değişti / Müsait değilim',
  'Acil bir durum oluştu',
  'Farklı bir güne randevu almak istiyorum',
  'Yanlış saat veya hizmet seçimi yaptım',
  'Diğer',
];

export function CancelAppointmentModal({ item, onClose, onConfirm }: CancelAppointmentModalProps) {
  const [reason, setReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    const finalReason = reason === 'Diğer' && customReason ? customReason : reason;
    setTimeout(() => {
      onConfirm(item.id, finalReason);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface-100 border border-surface-200 shadow-elevated p-6 sm:p-7"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-surface-200/60 text-surface-400 hover:text-white hover:bg-surface-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="text-center mb-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/25 mb-3">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Randevuyu İptal Etmek İstiyor musunuz?
            </h2>
            <p className="text-xs text-surface-400 mt-1">
              İptal edilen saat diğer müşterilere açılacaktır.
            </p>
          </div>

          {/* Randevu Bilgisi Kartı */}
          <div className="p-3.5 rounded-2xl bg-surface-200/50 border border-surface-300/40 mb-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Store className="h-3.5 w-3.5 text-accent-400" />
              <span>{item.businessName}</span>
            </div>
            <p className="text-surface-300 font-medium">{item.serviceName}</p>
            <div className="flex items-center gap-3 text-surface-400 pt-1 border-t border-surface-200/80">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary-400" />
                {item.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary-400" />
                {item.time}
              </span>
            </div>
          </div>

          {/* İptal Nedeni Seçimi */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-medium text-surface-300">
              Lütfen İptal Nedeninizi Seçin:
            </label>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r
                      ? 'bg-primary-500/15 border-primary-500/80 text-white font-medium'
                      : 'bg-surface-200/30 border-surface-300/40 text-surface-400 hover:text-surface-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-primary-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {reason === 'Diğer' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Lütfen iptal gerekçenizi kısaca belirtin..."
                className="w-full rounded-xl border border-surface-200 bg-surface-50 p-2.5 text-xs text-white placeholder:text-surface-500 outline-none focus:border-primary-400"
              />
            )}
          </div>

          {/* Alt Aksiyonlar */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-surface-300/60 hover:bg-surface-200/50 text-xs font-semibold text-surface-300 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'İptal Ediliyor...' : 'Randevuyu İptal Et'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
