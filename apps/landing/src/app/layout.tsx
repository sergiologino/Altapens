import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import { YandexMetrika } from '@/components/YandexMetrika'
import { siteName, siteUrl, seo } from '@/lib/site'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-body',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#f5efe6',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.title,
    template: `%s · ${siteName}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  authors: [{ name: 'AltaCare', url: siteUrl }],
  creator: 'AltaCare',
  publisher: 'AltaCare',
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName,
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: '/landing_picture.webp',
        width: 1200,
        height: 630,
        alt: 'Пожилой человек дома с ноутбуком AltaPens и семьёй на экране телевизора',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: ['/landing_picture.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: '/' },
  category: 'health',
}

function JsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    description: seo.description,
    areaServed: { '@type': 'Country', name: 'RU' },
    knowsAbout: [
      'забота о пожилых людях',
      'цифровая поддержка пенсионеров',
      'семейная опека',
      'напоминания о лекарствах',
    ],
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    inLanguage: 'ru-RU',
    description: seo.description,
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
  }
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
    description: seo.description,
    featureList: [
      'Напоминания о приёме лекарств',
      'Чек-ины самочувствия для семьи',
      'Голосовой и текстовый умный помощник',
      'Связь опекуна с подопечным',
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([org, website, software]),
      }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <JsonLd />
        <YandexMetrika />
        {children}
      </body>
    </html>
  )
}
