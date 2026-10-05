'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  item: {
    id: string;
    businessName: string;
    serviceName: string;
    currentRating?: number | null;
  } | null;
  onClose: () => void;
  onSubmit: (id: string, rating: number, comment: string, tags: string[]) => void;
}

const TAG_OPTIONS = [
  'Dakik ve Hızlı',
  'Güler Yüzlü Usta',
  'Temiz & Hijyenik',
  'Usta İşçilik',
  'Fiyat/Performans Mükemmel',
  'İkramlar & İlgi İyi',
];

export function ReviewModal({ item, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(item?.currentRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(item.id, rating, comment, selectedTags);
      toast.success('Değerlendirmeniz kaydedildi!', {
        description: 'Görüşleriniz işletme kalitesini artırmamızda büyük önem taşır.',
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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

          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 mb-3">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Hizmeti Değerlendir
            </h2>
            <p className="text-xs text-surface-400 mt-1">
              <strong className="text-white">{item.businessName}</strong> — {item.serviceName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Yıldızlar */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          filled
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-surface-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-amber-400">
                {rating === 5 && '🌟 Mükemmel Deneyim!'}
                {rating === 4 && '👍 Çok İyi'}
                {rating === 3 && '😐 Ortalama'}
                {rating === 2 && '👎 Beklentimin Altında'}
                {rating === 1 && '⚠️ Memnun Kalmadım'}
              </span>
            </div>

            {/* Hızlı Etiketler */}
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-2">
                Öne Çıkan Özellikler:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-primary-500/20 border-primary-500 text-primary-300 font-semibold shadow-soft'
                          : 'bg-surface-200/40 border-surface-300/40 text-surface-400 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Yorum Alanı */}
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                Yorumunuz (İsteğe Bağlı):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Hizmet, personel veya işletme hakkındaki deneyiminizi kısaca paylaşabilirsiniz..."
                className="w-full rounded-xl border border-surface-200 bg-surface-50 p-3 text-xs sm:text-sm text-surface-200 placeholder:text-surface-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none resize-none"
              />
            </div>

            {/* Gönder */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-200/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-surface-300/60 hover:bg-surface-200/50 text-xs font-semibold text-surface-300 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-xs font-bold text-white shadow-soft transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Kaydediliyor...' : 'Yorumu Kaydet'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
