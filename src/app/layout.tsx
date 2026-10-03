import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { STORAGE_KEY } from '@/store/persistence';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Pulseboard · Personalized Content Dashboard', template: '%s · Pulseboard' },
  description: 'News and social posts in one customizable dashboard.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
};

/**
 * Runs before first paint: applies the saved (or OS) theme so dark-mode users
 * never see a white flash while React hydrates.
 */
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||'{}');var p=s&&s.preferences||{};var t=p.theme;if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;if(t==='dark')r.classList.add('dark');r.style.colorScheme=t;if(p.language)r.lang=p.language}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
