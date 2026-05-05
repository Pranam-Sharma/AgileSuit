import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseProvider } from '@/auth/firebase/provider';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';

export const metadata: Metadata = {
  title: 'AgileSuit',
  description: 'A modern suite for agile development.',
};

import { CommandPalette } from '@/components/layout/command-palette';
import { BackgroundThemeProvider } from '@/modules/platform/background-theme-provider';
import { PlatformBackground } from '@/modules/platform/platform-background';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased animate-fade-in relative min-h-screen" suppressHydrationWarning>
        <GoogleAnalytics />
        <BackgroundThemeProvider>
          <PlatformBackground />
          <FirebaseProvider>
            <div className="relative z-10">
              {children}
            </div>
          </FirebaseProvider>
          <CommandPalette />
          <Toaster />
        </BackgroundThemeProvider>
      </body>
    </html>
  );
}
