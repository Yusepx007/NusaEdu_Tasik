import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import DesktopNavbar from '@/components/layout/DesktopNavbar';

export const metadata: Metadata = {
  title: 'NusaEdu Tasikmalaya — Platform Wisata & UMKM Berbasis AI',
  description: 'Aplikasi edukasi wisata Tasikmalaya — Scan AI, Kuis Interaktif & Komunitas Wisata',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NusaEdu',
  },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="mesh-bg" />
        <div id="mobile-root">
          <DesktopNavbar />
          {children}
        </div>
      </body>
    </html>
  );
}
