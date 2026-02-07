import type { Metadata, Viewport } from 'next';
import { Analytics } from "@vercel/analytics/next";
import './globals.css';
import { Providers } from '@/components/Providers';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { ProblemsProvider } from '@/context/ProblemsContext';
import { GlobalNav } from '@/components/GlobalNav';

export const metadata: Metadata = {
  title: 'NeetCode 150 Tracker',
  description: 'Track your progress through 150 essential coding problems',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NeetCode 150',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch problems globally once
  const db = await getDb();
  const collection = await db.collection(COLLECTIONS.COLLECTIONS).findOne({ slug: 'neetcode-150' });
  
  let problems: any[] = [];
  if (collection) {
    problems = await db.collection(COLLECTIONS.PROBLEMS)
      .find({ collectionId: collection._id })
      .sort({ order: 1 })
      .toArray();
  }

  // Serialize props
  const serializedProblems = JSON.parse(JSON.stringify(problems));
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Providers>
          <ProblemsProvider initialProblems={serializedProblems}>
            <GlobalNav />
            {children}
          </ProblemsProvider>
        </Providers>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

