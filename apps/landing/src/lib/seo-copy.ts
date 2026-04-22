import type { Metadata } from 'next'
import { siteName, siteUrl } from '@/lib/site'

const baseKeywords = [
  'AltaPens',
  'забота о пожилых',
  'приложение для пенсионеров',
  'семья и родители',
  'напоминания о лекарствах',
  'умный помощник',
] as const

export const pensionerPageMeta = {
  title: 'Для пенсионеров — крупный текст, голос и спокойствие',
  description:
    'Интерфейс AltaPens для пожилых людей: экран «Сегодня», напоминания о таблетках по времени, голосовой помощник, короткий рассказ о самочувствии, кнопка помощи и подсказки против обмана. Простые слова, без канцелярита.',
  keywords: [
    ...baseKeywords,
    'интерфейс для пенсионеров',
    'голосовой помощник пожилым',
    'таблетки по расписанию',
  ],
} as const

export const familyPageMeta = {
  title: 'Для родных — связь с мамой и папой на расстоянии',
  description:
    'Панель AltaPens для сыновей, дочерей и близких: сводка, список родителей в приложении, общая лента «что произошло», оформление курса лекарств, приглашение по коду и помощник. Без сухих терминов — только то, что нужно семье.',
  keywords: [
    ...baseKeywords,
    'забота о родителях на расстоянии',
    'семейная связь',
    'контроль лекарств для родных',
  ],
} as const

function ogImage(path: string) {
  return [{ url: path, width: 1200, height: 630, alt: siteName }]
}

export function buildPageMetadata(opts: {
  title: string
  description: string
  keywords: readonly string[]
  path: string
  ogImagePath?: string
}): Metadata {
  const url = `${siteUrl}${opts.path}`
  const ogPath = opts.ogImagePath ?? '/landing_picture.webp'
  return {
    title: opts.title,
    description: opts.description,
    keywords: [...opts.keywords],
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url,
      siteName,
      title: `${opts.title} · ${siteName}`,
      description: opts.description,
      images: ogImage(ogPath),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${opts.title} · ${siteName}`,
      description: opts.description,
      images: [ogPath],
    },
    alternates: { canonical: opts.path },
  }
}
