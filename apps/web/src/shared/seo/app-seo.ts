/** Базовый origin веб-приложения (не лендинг). Задаётся в `.env` как VITE_PUBLIC_SITE_URL. */
export function getAppSiteUrl(): string {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined
  return raw?.replace(/\/$/, '') ?? 'https://app.altapens.ru'
}

export type PageSeo = {
  title: string
  description: string
  keywords: string[]
}

const base: PageSeo = {
  title: 'AltaPens — приложение для заботы о пожилых близких',
  description:
    'Веб-приложение AltaPens: интерфейсы для пенсионера и опекуна — напоминания о лекарствах, чек-ины самочувствия, умный помощник и сеть заботы.',
  keywords: [
    'AltaPens',
    'приложение для пенсионеров',
    'опека на расстоянии',
    'лекарства напоминания',
    'семья и пожилые родители',
  ],
}

const routes: { prefix: string; seo: Partial<PageSeo> }[] = [
  {
    prefix: '/auth/login',
    seo: {
      title: 'Вход — AltaPens',
      description:
        'Вход в аккаунт AltaPens для подопечного или опекуна.',
    },
  },
  {
    prefix: '/auth/register',
    seo: {
      title: 'Регистрация — AltaPens',
      description:
        'Создание аккаунта в AltaPens: выбор роли подопечного или опекуна.',
    },
  },
  {
    prefix: '/auth/invite',
    seo: {
      title: 'Приглашение в сеть заботы — AltaPens',
      description:
        'Принятие приглашения по коду и связь с близкими в AltaPens.',
    },
  },
  {
    prefix: '/welcome',
    seo: {
      title: 'Добро пожаловать — AltaPens',
      description:
        'Знакомство с AltaPens: забота о старших и спокойствие семьи.',
    },
  },
  {
    prefix: '/start',
    seo: {
      title: 'Выбор роли — AltaPens',
      description:
        'Начало работы: вход как подопечный или как опекун.',
    },
  },
]

function mergeSeo(partial?: Partial<PageSeo>): PageSeo {
  if (!partial) return { ...base }
  return {
    title: partial.title ?? base.title,
    description: partial.description ?? base.description,
    keywords: partial.keywords ?? [...base.keywords],
  }
}

export function getSeoForPath(pathname: string): PageSeo {
  const hit = routes
    .filter((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]
  return mergeSeo(hit?.seo)
}

export function isPrivateAppPath(pathname: string): boolean {
  return (
    pathname.startsWith('/senior') || pathname.startsWith('/caregiver')
  )
}
