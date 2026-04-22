import { Capacitor } from '@capacitor/core'
import { useCallback, useLayoutEffect, useState } from 'react'
import { LaunchSplashScreen } from './LaunchSplashScreen'

/** Версия ключа: при смене заставки увеличить */
const STORAGE_KEY = 'altapens-launch-splash-v3'

function shouldSkipFromBrowserStorage(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

type Props = {
  children: React.ReactNode
}

/**
 * Натив: заставка при каждом холодном старте WebView (без sessionStorage).
 * Браузер: один раз за вкладку, если уже видели — пропуск до первого paint (useLayoutEffect).
 */
export function LaunchSplashGate({ children }: Props) {
  const [finished, setFinished] = useState(false)

  useLayoutEffect(() => {
    if (Capacitor.isNativePlatform()) {
      return
    }
    if (shouldSkipFromBrowserStorage()) {
      setFinished(true)
    }
  }, [])

  const handleComplete = useCallback(() => {
    if (!Capacitor.isNativePlatform()) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    setFinished(true)
  }, [])

  return (
    <>
      {children}
      {!finished ? <LaunchSplashScreen onComplete={handleComplete} /> : null}
    </>
  )
}
