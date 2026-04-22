import type { DeviceTierHints } from './types'
import type { UiTier } from './types'

const STORAGE_KEY = 'altapens-ui-snapshot-v1'
const W_EPS = 16

/**
 * Старое ядро Android: проще тени, меньше blur, крупнее минимальные тапы.
 * Порог можно подкрутить по метрикам из продакшена.
 */
const LEGACY_SDK_MAX = 29

/**
 * Синхронная оценка только по вьюпорту (до загрузки Capacitor), чтобы снизить скачок раскладки.
 */
export function resolveTierFromViewport(innerWidth: number, innerHeight: number): {
  tier: UiTier
  legacy: boolean
} {
  const shortSide = Math.min(innerWidth, innerHeight)
  if (shortSide <= 360 || innerWidth <= 320) {
    return { tier: 'compact', legacy: false }
  }
  if (shortSide <= 420) {
    return { tier: 'cozy', legacy: false }
  }
  return { tier: 'standard', legacy: false }
}

/**
 * Точный выбор с учётом API Android / iOS (после Device.getInfo).
 */
export function resolveTier(
  innerWidth: number,
  innerHeight: number,
  device: DeviceTierHints,
): { tier: UiTier; legacy: boolean; androidSDK?: number } {
  const shortSide = Math.min(innerWidth, innerHeight)
  const androidSdk = device?.platform === 'android' ? device.androidSDKVersion : undefined
  const legacy = androidSdk != null && androidSdk <= LEGACY_SDK_MAX

  if (shortSide <= 360 || innerWidth <= 320) {
    return { tier: 'compact', legacy, androidSDK: androidSdk }
  }

  if (legacy) {
    if (shortSide <= 480) {
      return { tier: 'cozy', legacy: true, androidSDK: androidSdk }
    }
  }

  if (shortSide <= 400) {
    return { tier: 'cozy', legacy, androidSDK: androidSdk }
  }

  if (androidSdk != null && androidSdk < 33 && shortSide <= 420) {
    return { tier: 'cozy', legacy, androidSDK: androidSdk }
  }

  return { tier: 'standard', legacy, androidSDK: androidSdk }
}

export function readCachedSnapshot(
  innerWidth: number,
  innerHeight: number,
): { tier: UiTier; legacy: boolean } | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as { w?: number; h?: number; tier?: UiTier; legacy?: boolean }
    if (s.w == null || s.h == null || s.tier == null) return null
    if (Math.abs(s.w - innerWidth) > W_EPS || Math.abs(s.h - innerHeight) > W_EPS) {
      return null
    }
    return { tier: s.tier, legacy: Boolean(s.legacy) }
  } catch {
    return null
  }
}

export function writeSnapshot(
  data: { tier: UiTier; legacy: boolean; w: number; h: number; androidSDK?: number },
) {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  try {
    const payload = {
      v: 1 as const,
      ...data,
      t: Date.now(),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export { STORAGE_KEY }
