import { Capacitor } from '@capacitor/core'

/**
 * Снимает нативный splash Capacitor как можно раньше после загрузки JS.
 * Иначе при launchAutoHide: false слой может перехватывать касания до вызова hide().
 */
export function hideNativeSplashEarly() {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
    return
  }
  queueMicrotask(() => {
    void import('@capacitor/splash-screen')
      .then(({ SplashScreen }) =>
        SplashScreen.hide({ fadeOutDuration: 120 }).catch(() => undefined),
      )
      .catch(() => undefined)
  })
}
