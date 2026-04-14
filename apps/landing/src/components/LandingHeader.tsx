import Link from 'next/link'
import styles from '@/app/landing.module.css'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

type NavKey = 'home' | 'pensioner' | 'family'

export function LandingHeader({ active }: { active: NavKey }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          AltaPens
        </Link>
        <nav className={styles.nav} aria-label="Основная навигация">
          <Link
            href="/"
            className={active === 'home' ? styles.navActive : undefined}
          >
            Главная
          </Link>
          <Link
            href="/dlya-pensionerov"
            className={active === 'pensioner' ? styles.navActive : undefined}
          >
            Для пенсионеров
          </Link>
          <Link
            href="/dlya-blizkih"
            className={active === 'family' ? styles.navActive : undefined}
          >
            Для близких
          </Link>
          <Link href="/#obzor">Обзор экранов</Link>
        </nav>
        <Link className={`${styles.btn} ${styles.btnPrimary}`} href={appHref}>
          Открыть приложение
        </Link>
      </div>
    </header>
  )
}
