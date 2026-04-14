import Image from 'next/image'
import Link from 'next/link'
import { siteName, seo } from '@/lib/site'
import styles from './landing.module.css'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

export default function HomePage() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>{siteName}</span>
          <nav className={styles.nav} aria-label="Основная навигация">
            <a href="#features">Возможности</a>
            <a href="#for-whom">Для кого</a>
            <a href="#trust">Надёжность</a>
          </nav>
          <Link
            className={`${styles.btn} ${styles.btnPrimary}`}
            href={appHref}
          >
            Открыть приложение
          </Link>
        </div>
      </header>

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
                  href="#features"
                >
                  Как это работает
                </a>
              </div>
            </div>
            <div>
              <figure className={styles.heroFigure}>
                <Image
                  src="/landing_picture.webp"
                  alt="Домашняя обстановка: пожилой человек за столом с открытым ноутбуком AltaPens, на экране телевизора — семья с телефонами и надпись «Папа, мы рядом!»"
                  width={1200}
                  height={800}
                  priority
                  sizes="(max-width: 960px) 100vw, 52vw"
                  className={styles.heroImg}
                />
                <figcaption className={styles.srOnly}>
                  Иллюстрация продукта: удобный интерфейс и связь с близкими.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          id="features"
          className={styles.section}
          aria-labelledby="features-heading"
        >
          <div className={styles.sectionInner}>
            <h2 id="features-heading" className={styles.sectionTitle}>
              Что даёт AltaPens
            </h2>
            <p className={styles.sectionIntro}>
              Всё, что вы прочитали в описании выше, реализовано в интерфейсе для
              пенсионера и отдельной панели для опекуна: напоминания, самочувствие и
              единая лента событий.
            </p>
            <ul className={styles.featureGrid}>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Умный помощник</h3>
                <p>
                  Голосовые и текстовые подсказки на понятном русском: расписание,
                  чек-ин, экстренные действия — без перегруза терминами.
                </p>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Лекарства и расписание</h3>
                <p>
                  Курс и слоты приёма видны и пенсионеру, и опекуну; фиксация
                  «принял / отложил» помогает не терять нить терапии.
                </p>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Сеть заботы</h3>
                <p>
                  Приглашение по коду связывает подопечного с близкими: статусы и
                  события собираются в одном месте — как в сцене «мы рядом» на
                  главном изображении.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="for-whom"
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="for-whom-heading"
        >
          <div className={`${styles.sectionInner} ${styles.twoCol}`}>
            <div>
              <h2 id="for-whom-heading" className={styles.sectionTitle}>
                Для пенсионеров и тех, кто о них заботится
              </h2>
              <p>
                Интерфейс для старшего поколения крупный и спокойный; панель опекуна
                — чуть плотнее, но без ощущения контроля. Оба контура согласованы по
                смыслу с тем, как описан продукт в заголовке и метаданных страницы.
              </p>
            </div>
            <ul className={styles.checklist}>
              <li>Понятные кнопки и крупный текст</li>
              <li>Защита от типовых сценариев мошенничества (быстрые действия)</li>
              <li>Чек-ины самочувствия для спокойствия семьи</li>
            </ul>
          </div>
        </section>

        <section
          id="trust"
          className={styles.section}
          aria-labelledby="trust-heading"
        >
          <div className={styles.sectionInner}>
            <h2 id="trust-heading" className={styles.sectionTitle}>
              Прозрачность для поисковых систем и нейросетей
            </h2>
            <p className={styles.sectionIntro}>
              На этой странице зафиксированы структурированные данные (Schema.org),
              корректные заголовки и описание — чтобы и люди, и автоматические
              обзоры точно понимали назначение сервиса.
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>
            © {new Date().getFullYear()} {siteName}. Платформа для заботы о близких.
          </p>
          <Link href={appHref}>Перейти в приложение</Link>
        </div>
      </footer>
    </>
  )
}
