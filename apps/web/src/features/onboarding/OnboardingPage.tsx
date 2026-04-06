import { useCallback, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { onboardingSlides } from '@/features/onboarding/onboarding-content'
import { useOnboardingStore } from '@/app/store/onboarding-store'

const SWIPE_THRESHOLD_PX = 48

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const replay = searchParams.get('replay') === '1'
  const markComplete = useOnboardingStore((s) => s.markOnboardingComplete)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const last = index === onboardingSlides.length - 1
  const slide = onboardingSlides[index]

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, onboardingSlides.length - 1))
  }, [])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const finish = useCallback(() => {
    if (!replay) {
      markComplete()
    }
    navigate('/start', { replace: true })
  }, [markComplete, navigate, replay])

  const skip = useCallback(() => {
    if (!replay) {
      markComplete()
    }
    navigate('/start', { replace: true })
  }, [markComplete, navigate, replay])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const dx = endX - touchStartX.current
    touchStartX.current = null
    if (dx < -SWIPE_THRESHOLD_PX) goNext()
    else if (dx > SWIPE_THRESHOLD_PX) goPrev()
  }

  return (
    <div className="onboarding-root">
      <header className="onboarding-topbar">
        {!replay ? (
          <button type="button" className="onboarding-skip" onClick={skip}>
            Пропустить
          </button>
        ) : (
          <button
            type="button"
            className="onboarding-skip"
            onClick={() => navigate('/start', { replace: true })}
          >
            Назад
          </button>
        )}
      </header>

      <div className="onboarding-stage">
        <div
          className={`onboarding-card onboarding-accent-${slide.accent}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="слайд"
          aria-label={`${index + 1} из ${onboardingSlides.length}`}
        >
          <div className="onboarding-card-inner">
            <p className="onboarding-kicker">Шаг {index + 1} из {onboardingSlides.length}</p>
            <h1 className="onboarding-title">{slide.title}</h1>
            <p className="onboarding-text">{slide.text}</p>
          </div>
          <div className="onboarding-dots" aria-hidden="true">
            {onboardingSlides.map((s, i) => (
              <span key={s.id} className={i === index ? 'onboarding-dot onboarding-dot-active' : 'onboarding-dot'} />
            ))}
          </div>
        </div>
      </div>

      <footer className="onboarding-footer">
        <div className="onboarding-nav-buttons">
          <button type="button" className="onboarding-nav-btn" onClick={goPrev} disabled={index === 0}>
            Назад
          </button>
          {last ? (
            <button type="button" className="onboarding-nav-btn onboarding-nav-btn-primary" onClick={finish}>
              {replay ? 'Закрыть' : 'Понятно, дальше'}
            </button>
          ) : (
            <button type="button" className="onboarding-nav-btn onboarding-nav-btn-primary" onClick={goNext}>
              Далее
            </button>
          )}
        </div>
        <p className="onboarding-hint">На телефоне можно листать слайды свайпом влево и вправо.</p>
      </footer>
    </div>
  )
}
