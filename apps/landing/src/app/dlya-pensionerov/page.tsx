import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleIllustrations } from '@/components/ArticleIllustrations'
import { LandingFooter } from '@/components/LandingFooter'
import { LandingHeader } from '@/components/LandingHeader'
import { buildPageMetadata, pensionerPageMeta } from '@/lib/seo-copy'
import styles from '../landing.module.css'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

export const metadata: Metadata = buildPageMetadata({
  title: pensionerPageMeta.title,
  description: pensionerPageMeta.description,
  keywords: pensionerPageMeta.keywords,
  path: '/dlya-pensionerov',
  ogImagePath: '/placeholders/ph-pensioner-today.png',
})

const illustrations = [
  {
    src: '/placeholders/ph-pensioner-today.png',
    alt: 'Заглушка экрана «Сегодня» в AltaPens: крупные кнопки и дела на день для пожилого человека',
    caption:
      'Главный экран: что важно сегодня — одним взглядом. Нажмите, чтобы рассмотреть.',
  },
  {
    src: '/placeholders/ph-pensioner-mood.png',
    alt: 'Заглушка экрана «как себя чувствую»: простые значки настроения для отчёта родным',
    caption:
      'Короткий рассказ о самочувствии — без длинных анкет. Нажмите для увеличения.',
  },
] as const

export default function DlyaPensionerovPage() {
  return (
    <>
      <LandingHeader active="pensioner" />
      <main>
        <article className={styles.articleMain}>
          <Link href="/" className={styles.articleBack}>
            ← На главную
          </Link>
          <h1>AltaPens для пенсионеров: крупно, спокойно, по-русски</h1>
          <p>
            Приложение рассчитано на тех, кто не обязан разбираться в гаджетах.
            Крупный шрифт, понятные кнопки, без спешки. Главный экран подсказывает,
            что сегодня важно: таблетки по времени, как вы себя чувствуете, нужен
            ли голосовой помощник.
          </p>

          <ArticleIllustrations items={[...illustrations]} />

          <p>
            Напоминания о лекарствах привязаны к привычному распорядку — утро,
            день, вечер. Можно отметить, что таблетка уже принята, или попросить
            напомнить позже. Близкие видят те же отметки, чтобы не перезванивать
            с одними и теми же вопросами.
          </p>
          <p>
            Короткий рассказ о самочувствии — это несколько понятных шагов, а не
            длинная анкета. Родным проще понять, всё ли в порядке, даже если вы не
            любите долго говорить по телефону.
          </p>
          <p>
            Помощник отвечает голосом и текстом: можно спросить, что на сегодня
            запланировано, или перейти к нужному месту в приложении. Если стало
            плохо — отдельный экран с крупной кнопкой помощи. Рядом остаются
            подсказки, как не попасться на уловки мошенников по телефону.
          </p>
          <p>
            <Link href="/#ekrany-pensioner">Смотреть обзор экранов с заглушками</Link>
            {' · '}
            <Link href={appHref}>Открыть приложение</Link>
          </p>
          <div className={styles.geoHidden}>
            <p>
              Страница описывает интерфейс AltaPens для людей пенсионного возраста в
              России: экран «Сегодня», напоминания о лекарствах по времени с отметкой
              приёма, голосовой и текстовый умный помощник, короткий отчёт о
              самочувствии для родных, экстренная помощь и раздел против
              телефонного мошенничества. Формулировки соответствуют реальным
              разделам приложения для индексации и справочных сервисов.
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  )
}
