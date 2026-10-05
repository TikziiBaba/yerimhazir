'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function QrCodePage() {
  const [businessSlug, setBusinessSlug] = useState('ahmet-usta-berber');
  const [businessName, setBusinessName] = useState('Ahmet Usta Berber');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrColor, setQrColor] = useState('#6366f1');
  const [tableNumber, setTableNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yerimhazir.com';
  const qrUrl = tableNumber
    ? `${origin}/${businessSlug}?masa=${tableNumber}`
    : `${origin}/${businessSlug}`;

  useEffect(() => {
    QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: qrColor,
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, [qrUrl, qrColor]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success('Randevu linki panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${businessSlug}-qr.png`;
    link.click();
    toast.success('QR kod başarıyla indirildi!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-surface-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <QrCode className="inline h-6 w-6 mr-2 text-primary-400" />
            İşletme QR Kodu
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Müşterilerinizin dükkanda veya masada telefonlarıyla okutup anında sıra/randevu alması için QR kodunuz
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-100 border border-surface-200 text-xs sm:text-sm font-semibold text-surface-400 hover:text-surface-900 hover:bg-surface-200 transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            PNG İndir
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            Afiş Yazdır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: QR Önizleme & Yazdırılabilir Kart */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-surface-100 border border-surface-200 shadow-soft p-6 sm:p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* QR Kart Önizleme (Afiş Stili) */}
            <div
              ref={printRef}
              className="w-full max-w-sm rounded-2xl bg-white text-surface-900 p-6 shadow-xl border border-surface-300 flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
                  YH
                </div>
                <span className="font-bold text-sm text-surface-900">YerimHazır</span>
              </div>

              <h3 className="text-lg font-extrabold text-surface-950 mb-1">{businessName}</h3>
              <p className="text-xs text-surface-600 mb-4 text-center">
                {tableNumber ? `Masa / Koltuk No: #${tableNumber}` : 'Sıra veya Randevu Almak İçin Okutun'}
              </p>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-xl border border-surface-200 shadow-inner mb-4">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="İşletme QR Kodu"
                    className="w-48 h-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-lg bg-surface-100 flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                Telefonunuzun kamerasını tutun
              </div>
            </div>

            {/* Link kutusu */}
            <div className="w-full max-w-sm mt-6 flex items-center gap-2 p-1.5 rounded-lg bg-surface-200/50 border border-surface-200">
              <input
                type="text"
                readOnly
                value={qrUrl}
                className="flex-1 min-w-0 bg-transparent px-2 text-xs text-surface-400 outline-none font-mono truncate"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-surface-300 hover:text-surface-900 transition-colors border border-surface-200 shrink-0 whitespace-nowrap"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sağ Kolon: QR Özelleştirme & Kullanım İpuçları */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-surface-100 border border-surface-200 p-6 space-y-5 shadow-soft">
            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary-400" />
              QR Özelleştirme
            </h3>

            {/* Renk Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-2">QR Tema Rengi</label>
              <div className="flex items-center gap-2.5">
                {[
                  { label: 'İndigo', color: '#6366f1' },
                  { label: 'Zümrüt', color: '#10b981' },
                  { label: 'Mor', color: '#8b5cf6' },
                  { label: 'Klasik Siyah', color: '#09090b' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setQrColor(c.color)}
                    className="h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: c.color,
                      borderColor: qrColor === c.color ? '#ffffff' : 'transparent',
                      outline: qrColor === c.color ? '2px solid #6366f1' : 'none',
                    }}
                    title={c.label}
                  >
                    {qrColor === c.color && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Masa / Koltuk No Opsiyonu */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                Masa veya Koltuk Numarası (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Örn: 4 veya Koltuk-1"
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 px-3 text-sm text-surface-900 focus:border-primary-400 outline-none"
              />
              <p className="text-[11px] text-surface-400 mt-1">
                Her masa veya berber koltuğu için ayrı afiş basmak isterseniz numara girebilirsiniz.
              </p>
            </div>
          </div>

          {/* Tavsiyeler Kartı */}
          <div className="rounded-2xl bg-surface-100 border border-surface-200 p-6 space-y-3.5 shadow-soft">
            <h4 className="text-sm font-bold text-surface-800">💡 Nerede Kullanabilirsiniz?</h4>
            <ul className="text-xs text-surface-500 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 font-bold">•</span>
                <span><strong>Dükkan Kapısı & Camı:</strong> Kapalıyken dahi geçen müşteriler okutup sonraki günlere randevu alabilir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 font-bold">•</span>
                <span><strong>Kasa veya Tezgâh Üstü:</strong> Ödeme yaparken bir sonraki randevularını kolayca planlarlar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 font-bold">•</span>
                <span><strong>Sosyal Medya:</strong> Instagram veya WhatsApp durumunuzda paylaşarak randevu toplamaya başlayın.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
