import type { UiTier } from './types'

export function applyDocumentUi(
  tier: UiTier,
  legacy: boolean,
  extra?: { androidSDK?: number },
) {
  const root = document.documentElement
  root.dataset.uiTier = tier
  if (legacy) {
    root.setAttribute('data-ui-legacy', 'true')
  } else {
    root.removeAttribute('data-ui-legacy')
  }
  if (extra?.androidSDK != null) {
    root.setAttribute('data-ui-android-sdk', String(extra.androidSDK))
  } else {
    root.removeAttribute('data-ui-android-sdk')
  }
}
