import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { buildWebSiteSchema } from '@/lib/schema';
import '@/app/globals.css';

// Body — clean, technical, neutral grotesque
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

// Telemetry / data labels — monospace
const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Display — distinctive, characterful headings
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traffic-camera-explorer.netlify.app';

export const metadata: Metadata = {
  title: {
    default: 'TrafficEye',
    template: '%s | TrafficEye',
  },
  description:
    'Explore live California traffic cameras from Caltrans. Search by address or browse the map to find cameras near you.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'TrafficEye',
    description: 'Live traffic cameras across California — search by address or browse the map.',
    type: 'website',
    url: siteUrl,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Traffic Camera Explorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrafficEye',
    description: 'Live traffic cameras across California',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = buildWebSiteSchema(siteUrl);

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${bricolage.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
