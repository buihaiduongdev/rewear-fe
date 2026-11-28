import type { Metadata } from 'next';

import { dmSans, geistMono } from '@/shared/config/fonts';
import { AuthProvider, QueryProvider } from '@/shared/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'RE.WEAR',
  description: 'Pre-owned clothing from independent sellers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
