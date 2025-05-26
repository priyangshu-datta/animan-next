import './globals.css';

import NavBar from '@/components/navbar';
import { ReactQueryClientProvider } from '@/providers/react-query-client-provider';
import { Box, ColorModeScript, UIProvider } from '@yamada-ui/react';
import { Geist, Geist_Mono as GeistMono } from 'next/font/google';

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
        suppressHydrationWarning
      >
        <ColorModeScript />
        <ReactQueryClientProvider>
          <UIProvider>
            <NavBar />
            <Box>{children}</Box>
          </UIProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
