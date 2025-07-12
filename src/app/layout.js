import './globals.css';

import NavBar from '@/components/navbar';
import { Box, ColorModeScript, UIProvider } from '@yamada-ui/react';
import { Geist, Geist_Mono as GeistMono } from 'next/font/google';
import Providers from './providers';

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
        <ColorModeScript initialColorMode="system" />
        <UIProvider>
          <Providers>
            <NavBar />
            <Box>{children}</Box>
          </Providers>
        </UIProvider>
      </body>
    </html>
  );
}
