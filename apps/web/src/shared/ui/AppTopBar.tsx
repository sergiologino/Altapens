import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/shared/ui/BrandLogo'
import { DONATE_BANNER_SESSION_KEY } from '@/shared/lib/donate-banner-session'

function subscribeDonateDismissed(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener('altapens-donate-banner', onStoreChange)
  return () => window.removeEventListener('altapens-donate-banner', onStoreChange)
}

function getDonateDismissedSnapshot() {
  try {
    return sessionStorage.getItem(DONATE_BANNER_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function getDonateDismissedServerSnapshot() {
  return false
}

export function AppTopBar() {
  const donateDismissed = useSyncExternalStore(
    subscribeDonateDismissed,
    getDonateDismissedSnapshot,
    getDonateDismissedServerSnapshot,
  )

  const dismissDonate = () => {
    try {
      sessionStorage.setItem(DONATE_BANNER_SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('altapens-donate-banner'))
  }

  return (
    <header className="app-topbar" role="banner">
      <div className="app-topbar-cluster">
        <Link to="/" className="app-topbar-brand">
          <BrandLogo size={36} />
          <span className="app-topbar-title">AltaPens</span>
        </Link>
        {!donateDismissed ? (
          <div className="app-topbar-donate-wrap">
            <Link
              to="/donate"
              className="button-link button-secondary app-topbar-donate"
              aria-label="Поддержать проект"
            >
              <span className="app-topbar-donate-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <circle cx="9" cy="14" r="4.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="16.5" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path
                    d="M6.5 8.5c1-2 2.8-3.2 5-3.2 1.2 0 2.3.4 3.2 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="app-topbar-donate-text">
                <span className="app-topbar-donate-line">Поддержать</span>
                <span className="app-topbar-donate-line">проект</span>
              </span>
            </Link>
            <button
              type="button"
              className="app-topbar-donate-close"
              onClick={dismissDonate}
              aria-label="Скрыть ссылку «Поддержать проект» до следующего входа"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
