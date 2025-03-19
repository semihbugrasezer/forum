import "./globals.css";
import type { Metadata } from 'next'
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THY Forum",
  description: "Türk Hava Yolları yolcuları ve çalışanları için Türkiye'nin en büyük havacılık topluluğu",
};

// Use preload for critical resources
export const viewport = {
  themeColor: '#E81932',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Critical preloads for high-traffic site */}
        <link rel="preconnect" href="https://oauhlrhvaqiuusuiqfno.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://oauhlrhvaqiuusuiqfno.supabase.co" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
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
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-center" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
