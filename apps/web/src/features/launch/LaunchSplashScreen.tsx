import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type KeyboardEvent,
} from 'react'
import styles from './LaunchSplashScreen.module.css'

type Props = {
  onComplete: () => void
}

/** Только тап или длинный таймаут; без автозакрытия через несколько секунд. */
const FAILSAFE_MS = 60_000

/** Сердце — тот же контур, что brand-logo.svg / favicon (viewBox 0 0 24 24) */
function BrandLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fill="#c53030"
        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17l-.022.012-.007.003-.004.002a.752.752 0 01-.704 0l-.004-.002z"
      />
    </svg>
  )
}

export function LaunchSplashScreen({ onComplete }: Props) {
  const [exiting, setExiting] = useState(false)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onCompleteRef.current()
  }, [])

  const requestExit = useCallback(() => {
    setExiting((prev) => (prev ? prev : true))
  }, [])

  useEffect(() => {
    const tFailsafe = window.setTimeout(() => requestExit(), FAILSAFE_MS)
    return () => window.clearTimeout(tFailsafe)
  }, [requestExit])

  const onExitAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (!exiting) return
    const name = e.animationName
    if (!name.includes('backdropFade')) return
    complete()
  }

  const onBackdropClick = () => {
    requestExit()
  }

  const onBackdropKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      requestExit()
    }
  }

  return (
    <div
      className={`${styles.backdrop} ${exiting ? styles.backdropExit : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-splash-slogan"
      aria-describedby="launch-splash-sub"
      onAnimationEnd={onExitAnimationEnd}
      onClick={onBackdropClick}
      onKeyDown={onBackdropKeyDown}
      tabIndex={-1}
    >
      <div className={styles.heroArt} aria-hidden />
      <div className={`${styles.orb} ${styles.orb1}`} aria-hidden />
      <div className={`${styles.orb} ${styles.orb2}`} aria-hidden />
      <div className={`${styles.orb} ${styles.orb3}`} aria-hidden />

      <div className={styles.content}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.logoWrap}>
          <BrandLogoIcon className={styles.logo} />
        </div>

        <h1 id="launch-splash-slogan" className={styles.slogan}>
          Тепло рядом — даже на расстоянии
        </h1>
        <p id="launch-splash-sub" className={styles.sub}>
          Нежная забота о старших близких, которые особенно нуждаются в вашем внимании
        </p>
        <div className={styles.brand}>AltaPens</div>
        <div className={styles.hearts} aria-hidden>
          <span className={styles.miniHeart} />
          <span className={styles.miniHeart} />
          <span className={styles.miniHeart} />
        </div>
        <p className={styles.tapHint}>Нажмите на экран, чтобы продолжить</p>
      </div>
    </div>
  )
}
