import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleIllustrations } from '@/components/ArticleIllustrations'
import { LandingFooter } from '@/components/LandingFooter'
import { LandingHeader } from '@/components/LandingHeader'
import { buildPageMetadata, familyPageMeta } from '@/lib/seo-copy'
import styles from '../landing.module.css'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

export const metadata: Metadata = buildPageMetadata({
  title: familyPageMeta.title,
  description: familyPageMeta.description,
  keywords: familyPageMeta.keywords,
  path: '/dlya-blizkih',
  ogImagePath: '/placeholders/ph-family-dashboard.png',
})

const illustrations = [
  {
    src: '/placeholders/ph-family-dashboard.png',
    alt: 'Заглушка сводки для близких в AltaPens: карточки родителей и дела на день',
    caption:
      'Сводка: кому вы помогаете и что требует внимания. Нажмите картинку, чтобы увеличить.',
  },
  {
    src: '/placeholders/ph-family-timeline.png',
    alt: 'Заглушка ленты событий: приём таблеток и отметки о самочувствии по времени',
    caption:
      'Общая лента «что произошло» — без прыжков между чатами. Увеличение по клику.',
  },
] as const

export default function DlyaBlizkihPage() {
  return (
    <>
      <LandingHeader active="family" />
      <main>
        <article className={styles.articleMain}>
          <Link href="/" className={styles.articleBack}>
            ← На главную
          </Link>
          <h1>AltaPens для близких: мама и папа на связи, без лишней суеты</h1>
          <p>
            Этот интерфейс — для сыновей, дочерей и родных, которые помогают
            пожилым родителям из другого города или просто хотят быть в курсе. Здесь
            нет сухих таблиц: сначала сводка — кому вы помогаете и что требует
            внимания сегодня.
          </p>

          <ArticleIllustrations items={[...illustrations]} />

          <p>
            В списке — родители, с которыми вы связаны через приложение. У каждого
            своя карточка: как идёт лечение, что отмечено за день, есть ли
            поводы перезвонить. Общая лента показывает, что произошло по времени:
            приём таблеток, отметки о самочувствии и другие события — в одном
            потоке, без перескакивания между чатами и блокнотом.
          </p>
          <p>
            Курс лекарств можно оформить и поправить так, чтобы родителю было
            понятно на его экране: время и названия крупно, без лишних терминов в
            интерфейсе. Приглашение в семью делается по коду — родителю не нужно
            долго регистрироваться по длинной инструкции.
          </p>
          <p>
            Помощник и настройки помогают держать связь в уважительном тоне: это
            поддержка, а не контроль. При необходимости вы смотрите те же смыслы,
            что и пенсионер, с чуть большим количеством подробностей на своей
            стороне.
          </p>
          <p>
            <Link href="/#ekrany-blizkie">Смотреть обзор экранов с заглушками</Link>
            {' · '}
            <Link href={appHref}>Открыть приложение</Link>
          </p>
          <div className={styles.geoHidden}>
            <p>
              Страница описывает интерфейс AltaPens для родственников и близких
              людей в России: сводка по родителям, список и карточка родного
              человека, общая лента событий, оформление курса лекарств, приглашение
              по коду, помощник и настройки. Текст согласован с функциями продукта
              для поисковых систем и справочных сервисов на базе больших языковых
              моделей.
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  )
}
