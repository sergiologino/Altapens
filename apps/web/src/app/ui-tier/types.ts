/**
 * «Тиры» UI для слабых/узких экранов и старых Android (подопечные 60+).
 * - standard — обычная вёрстка;
 * - compact — очень узкий портрет (≈старые 360×640 и т.п.);
 * - cozy — комфортнее типографика/тапы при среднем экране и/или «старый» API.
 */
export type UiTier = 'standard' | 'compact' | 'cozy'

export type DeviceTierHints = {
  platform: 'ios' | 'android' | 'web'
  androidSDKVersion?: number
} | null

export type UiSnapshotV1 = {
  v: 1
  tier: UiTier
  legacy: boolean
  w: number
  h: number
  t: number
  androidSDK?: number
}
