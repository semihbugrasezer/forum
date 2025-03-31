import "./globals.css";
import '@/styles/easymde.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: '%s | THY Forum',
    default: "THY Forum - Türk Hava Yolları Yolcu ve Çalışan Forumu",
  },
  description: "Türk Hava Yolları yolcuları ve çalışanları için Türkiye'nin en büyük havacılık topluluğu. Uçuşlar, seyahat ipuçları ve havacılık hakkında bilgiler.",
  keywords: ["THY", "Türk Hava Yolları", "havacılık", "uçuş", "seyahat", "forum", "topluluk"],
  authors: [{ name: "Türk Hava Yolları" }],
  creator: "Türk Hava Yolları",
  publisher: "Türk Hava Yolları",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://forum.thy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "THY Forum - Türk Hava Yolları Resmi Forum Sitesi",
    description: "Türk Hava Yolları yolcuları ve çalışanları için Türkiye'nin en büyük havacılık topluluğu",
    siteName: "THY Forum",
    images: [
      {
        url: "/images/thy-forum-og.jpg",
        width: 1200,
        height: 630,
        alt: "THY Forum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THY Forum - Türk Hava Yolları Resmi Forum Sitesi",
    description: "Türk Hava Yolları yolcuları ve çalışanları için Türkiye'nin en büyük havacılık topluluğu",
    images: ["/images/thy-forum-og.jpg"],
    creator: "@TK_TR",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Enhanced viewport settings for better mobile experience
export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Performance optimizations for high-traffic site */}
        <link rel="preconnect" href="https://oauhlrhvaqiuusuiqfno.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://oauhlrhvaqiuusuiqfno.supabase.co" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/images/logo.svg" as="image" type="image/svg+xml" />
        
        {/* PWA support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* Responsive meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full max-w-[1920px] mx-auto">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
