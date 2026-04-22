export const DONATE_BANNER_SESSION_KEY = 'altapens-donate-banner-dismissed'

/** Вызывать после успешного входа или регистрации — баннер снова показывается. */
export function clearDonateBannerDismissForNewLogin() {
  if (typeof window === 'undefined') {
    return
  }
  try {
    sessionStorage.removeItem(DONATE_BANNER_SESSION_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('altapens-donate-banner'))
}
