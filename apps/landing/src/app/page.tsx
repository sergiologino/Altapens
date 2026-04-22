import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroIllustration } from '@/components/HeroIllustration'
import { LandingFooter } from '@/components/LandingFooter'
import { LandingHeader } from '@/components/LandingHeader'
import { PlaceholderFigure } from '@/components/PlaceholderFigure'
import { ScreenRow } from '@/components/ScreenRow'
import { seo, siteUrl } from '@/lib/site'
import styles from './landing.module.css'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: siteUrl },
}

export default function HomePage() {
  return (
    <>
      <LandingHeader active="home" />

      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>Забота о старшем поколении</p>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Помощь родителям и спокойствие для всей семьи
              </h1>
              <p className={styles.lead}>{seo.description}</p>
              <div className={styles.heroCta}>
                <Link
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                  href={appHref}
                >
                  Начать бесплатно
                </Link>
                <a
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
                  href="#vozmozhnosti"
                >
                  Как это устроено
                </a>
              </div>
              <div className={styles.subNav}>
                <Link href="/dlya-pensionerov">Подробнее для пенсионеров</Link>
                <span aria-hidden="true">·</span>
                <Link href="/dlya-blizkih">Подробнее для близких</Link>
              </div>
            </div>
            <div>
              <HeroIllustration alt="Домашняя обстановка: пожилой человек за столом с открытым ноутбуком AltaPens, на экране телевизора — семья с телефонами и надпись «Папа, мы рядом!»" />
            </div>
          </div>
        </section>

        <section
          id="vozmozhnosti"
          className={styles.section}
          aria-labelledby="vozmozhnosti-heading"
        >
          <div className={styles.sectionInner}>
            <h2 id="vozmozhnosti-heading" className={styles.sectionTitle}>
              Три опоры AltaPens
            </h2>
            <p className={styles.sectionIntro}>
              Одно приложение — два спокойных интерфейса: для пенсионера крупно и
              без лишних слов, для близких — чуть больше деталей, чтобы ничего не
              упустить.
            </p>
            <ul className={styles.featureGrid}>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Умный помощник</h3>
                <p>
                  Можно нажимать кнопки или говорить вслух по-русски: напоминания,
                  вопрос «как себя чувствуете», экстренная помощь — без
                  «технического» языка.
                </p>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Лекарства по расписанию</h3>
                <p>
                  Время приёма и названия видны и пенсионеру, и близким. Отметка
                  «принял» или «отложу» помогает не путаться в курсе лечения.
                </p>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Связь с семьёй</h3>
                <p>
                  По приглашению родные видят общую картину: что случилось за день,
                  как дела, были ли напоминания — всё в одной ленте, без
                  догадок.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="obzor"
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="obzor-heading"
        >
          <div className={styles.sectionInner}>
            <h2 id="obzor-heading" className={styles.sectionTitle}>
              Обзор экранов приложения
            </h2>
            <p className={styles.sectionIntro}>
              Ниже — что увидит пенсионер и что увидят близкие. Названия совпадают
              с разделами внутри AltaPens; подписи простые, как в самом
              интерфейсе.
            </p>

            <h3
              id="ekrany-pensioner"
              className={styles.subsectionTitle}
            >
              Разделы для пенсионера
            </h3>
            <p className={styles.subsectionLead}>
              Крупные кнопки, спокойные цвета. Везде обычные слова: «сегодня»,
              «таблетки», «как дела», «помощь» — так же, как в разговоре дома.
            </p>

            <ScreenRow>
              <PlaceholderFigure
                src="/placeholders/ph-pensioner-today.png"
                alt="Заглушка экрана «Сегодня»: крупные кнопки и дела на день"
                caption="Главный экран «Сегодня»"
                body="Сводка на день: что важно не забыть, куда нажать дальше.
                  Один экран — одна задача, без перегруза."
                priority
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Стартует день с простого плана: что сейчас по делу — лекарства,
                  самочувствие или помощник. Подходит для ежедневного ритма без
                  лишних экранов.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow reverse>
              <PlaceholderFigure
                src="/placeholders/ph-pensioner-meds.png"
                alt="Заглушка напоминаний о таблетках по времени"
                caption="Напоминания о таблетках"
                body="По времени суток: что принять и когда. Можно отметить, что
                  таблетка уже принята или отложить напоминание."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Близким спокойнее, когда видно, что курс не сбивается; пенсионеру
                  проще помнить не «окно приёма», а привычное время — утро, обед,
                  вечер.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow>
              <PlaceholderFigure
                src="/placeholders/ph-pensioner-assistant.png"
                alt="Заглушка голосового помощника"
                caption="Помощник"
                body="Текст или голос: спросить, напомнить или перейти к нужному
                  разделу — на понятном русском."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Когда неудобно искать по меню — удерживаете кнопку и говорите.
                  Подходит тем, кто привык разговаривать, а не читать мелкий текст.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow reverse>
              <PlaceholderFigure
                src="/placeholders/ph-pensioner-mood.png"
                alt="Заглушка экрана «как себя чувствую»"
                caption="Как себя чувствую"
                body="Короткий отчёт о самочувствии — близким видно, что всё в
                  порядке или есть повод перезвонить."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Вместо длинных опросов — пара понятных шагов. Родным не нужно
                  угадывать по голосу в телефоне, всё зафиксировано в приложении.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow>
              <PlaceholderFigure
                src="/placeholders/ph-pensioner-sos.png"
                alt="Заглушка экрана экстренной помощи"
                caption="Если стало плохо"
                body="Крупная кнопка помощи и понятные шаги — когда важна скорость,
                  а не поиск по меню."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  В стрессовой ситуации нужен один явный сигнал. Рядом остаются и
                  подсказки по безопасности — отдельным разделом про звонки
                  мошенников.
                </p>
              </div>
            </ScreenRow>

            <h3 id="ekrany-blizkie" className={styles.subsectionTitle}>
              Разделы для близких
            </h3>
            <p className={styles.subsectionLead}>
              Для сыновей, дочерей и родных, которые помогают маме или папе из
              другого города — чуть плотнее информация, но без ощущения
              «надзора».
            </p>

            <ScreenRow>
              <PlaceholderFigure
                src="/placeholders/ph-family-dashboard.png"
                alt="Заглушка сводки для близких"
                caption="Сводка"
                body="Общая картина: кому вы помогаете и что требует внимания
                  сегодня."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Быстрый вход: кто из родителей в приложении, есть ли открытые
                  напоминания или сообщения за сутки.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow reverse>
              <PlaceholderFigure
                src="/placeholders/ph-family-timeline.png"
                alt="Заглушка ленты событий для близких"
                caption="Лента «что произошло»"
                body="События по времени: приём таблеток, отметки о самочувствии и
                  другое — в одной ленте."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Не нужно переспрашивать по десять раз: видно согласованную
                  историю за день или неделю — в зависимости от настроек.
                </p>
              </div>
            </ScreenRow>

            <ScreenRow>
              <PlaceholderFigure
                src="/placeholders/ph-family-invite.png"
                alt="Заглушка приглашения в приложение по коду"
                caption="Приглашение в семью"
                body="Родные подключаются по коду — пенсионер вводит его один раз,
                  без сложной регистрации."
              />
              <div>
                <h4 className={styles.featureTitle}>Зачем это нужно</h4>
                <p className={styles.screenBody}>
                  Связь «мама — дети» настраивается без лишних звонков в поддержку:
                  сгенерировали код, подсказали родителю, готово.
                </p>
              </div>
            </ScreenRow>

            <p className={styles.subsectionLead}>
              Отдельно в приложении есть оформление курса лекарств, карточка
              родителя, настройки и помощник для близких — по смыслу то же самое:
              меньше тревоги, больше ясности.
            </p>

            <div className={styles.heroCta}>
              <Link
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                href={appHref}
              >
                Открыть приложение
              </Link>
              <Link
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
                href="/dlya-pensionerov"
              >
                Страница для пенсионеров
              </Link>
              <Link
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
                href="/dlya-blizkih"
              >
                Страница для близких
              </Link>
            </div>
          </div>
        </section>

        <div className={styles.geoHidden}>
          <p>
            AltaPens — российское веб-приложение для повседневной поддержки
            пожилых людей и координации с родными: напоминания о лекарствах по
            времени, короткие отметки о самочувствии, голосовой и текстовый умный
            помощник, экстренная кнопка, подсказки против телефонного обмана,
            приглашение близких по коду и общая лента событий для семьи. Сервис
            относится к категории заботы о здоровье и семейной связи; материалы на
            сайте согласованы с функциями продукта для поисковых систем и
            справочных сервисов на базе больших языковых моделей.
          </p>
        </div>
      </main>

      <LandingFooter />
    </>
  )
}
