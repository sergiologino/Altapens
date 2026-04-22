import Link from 'next/link'
import styles from '@/app/landing.module.css'
import { siteName } from '@/lib/site'

const appHref = process.env.NEXT_PUBLIC_APP_URL ?? '/app'

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>
          © {new Date().getFullYear()} {siteName}. Платформа для заботы о близких.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/dlya-pensionerov">Для пенсионеров</Link>
          <Link href="/dlya-blizkih">Для близких</Link>
          <Link href={appHref}>Перейти в приложение</Link>
        </div>
      </div>
    </footer>
  )
}
