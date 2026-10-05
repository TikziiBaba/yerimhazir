import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://yerimhazir.com'),
  title: {
    default: "YerimHazır - Randevu ve Sıra Yönetim Platformu",
    template: "%s | YerimHazır",
  },
  description:
    "Yerel esnaflar için modern randevu ve sıra yönetim platformu. Berber, kuaför, oto yıkama, halı saha ve daha fazlası için 60 saniyede online randevu sayfanı oluştur.",
  keywords: [
    "randevu sistemi",
    "sıra yönetimi",
    "online randevu",
    "berber randevu",
    "kuaför randevu",
    "oto yıkama randevu",
    "halı saha rezervasyon",
    "esnaf yazılım",
    "yerimhazır",
  ],
  authors: [{ name: "YerimHazır" }],
  creator: "YerimHazır",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://yerimhazir.com",
    siteName: "YerimHazır",
    title: "YerimHazır - Randevu ve Sıra Yönetim Platformu",
    description:
      "Defteri kalemi çöpe atın! Yerel esnaflar için modern randevu yönetimi.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YerimHazır - Randevu ve Sıra Yönetim Platformu",
    description:
      "Defteri kalemi çöpe atın! Yerel esnaflar için modern randevu yönetimi.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased bg-surface-50 text-surface-700 min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              padding: "14px 16px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6)",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
