import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { buildWebSiteSchema } from '@/lib/schema';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traffic-camera-explorer.netlify.app';

export const metadata: Metadata = {
  title: {
    default: 'Traffic Camera Explorer',
    template: '%s | Traffic Camera Explorer',
  },
  description:
    'Explore live California traffic cameras from Caltrans. Search by address or browse the map to find cameras near you.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Traffic Camera Explorer',
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
    title: 'Traffic Camera Explorer',
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
