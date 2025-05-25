import './globals.css';

import { Geist, Geist_Mono as GeistMono } from 'next/font/google';
import { ReactQueryClientProvider } from '@/providers/react-query-client-provider';
import { Box, ColorModeScript, Loading, UIProvider } from '@yamada-ui/react';
import NavBar from '@/components/navbar';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayoutWrapper({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryClientProvider>
          <ColorModeScript />
          <UIProvider>
            <Suspense fallback={<Loading />}>
              <NavBar />
            </Suspense>
            <Box>{children}</Box>
          </UIProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
