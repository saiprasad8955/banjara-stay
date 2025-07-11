/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

// ----------------------------------------------------------------------

import PropTypes from 'prop-types';

import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';

import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: 'Banjara - Stay',
  description:
    'Easily manage rental details and electricity bills with BanjaraStay. A smart, hassle-free solution for tenants and homeowners.',
  keywords: 'react,material,kit,application,dashboard,admin,template',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon/favicon-32x32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/favicon/apple-touch-icon.png' },
  ],
  // ✅ Add these for social sharing
  openGraph: {
    title: 'Banjara - Stay',
    description: 'Easily manage rental details and electricity bills with BanjaraStay.',
    url: 'https://banjara-stay-w88q.vercel.app/auth/login',
    siteName: 'BanjaraStay',
    images: [
      {
        url: 'https://banjara-stay-w88q.vercel.app/logo/logo_single.png',
        width: 1200,
        height: 630,
        alt: 'BanjaraStay preview image',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Banjara - Stay',
    description: 'Easily manage rental details and electricity bills with BanjaraStay.',
    images: ['https://banjara-stay-w88q.vercel.app/logo/logo_single.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body>
        <AuthProvider>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light', // 'light' | 'dark'
              themeDirection: 'ltr', //  'rtl' | 'ltr'
              themeContrast: 'default', // 'default' | 'bold'
              themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SettingsDrawer />
                <ProgressBar />
                {children}
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node,
};
