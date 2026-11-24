import type { Metadata } from 'next';
import { Barlow_Condensed, Barlow_Semi_Condensed, Inter } from 'next/font/google';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-label',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'APERTURE ROW — Vintage Cameras · Berlin',
  description:
    'Vintage camera shop & servicing bench in Berlin. Hand-calibrated rangefinders, TLRs, SLRs, Super 8 and medium format film cameras.',
  openGraph: {
    title: 'APERTURE ROW — Vintage Cameras · Berlin',
    description:
      'Vintage camera shop & servicing bench in Berlin. Hand-calibrated rangefinders, TLRs, SLRs, Super 8 and medium format film cameras.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APERTURE ROW — Vintage Cameras · Berlin',
    description:
      'Vintage camera shop & servicing bench in Berlin. Hand-calibrated rangefinders, TLRs, SLRs, Super 8 and medium format film cameras.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlowSemiCondensed.variable} ${inter.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
