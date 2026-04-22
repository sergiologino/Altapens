import { applyDocumentUi } from './applyDocumentUi'
import { getDeviceInfoSafe } from './getDeviceInfoSafe'
import { resolveTier, writeSnapshot } from './resolveTier'
import type { UiTier } from './types'

let lastKey = ''

function snapshotKey(
  w: number,
  h: number,
  tier: UiTier,
  legacy: boolean,
  sdk: number | undefined,
) {
  return `${w}x${h}|${tier}|${legacy ? 1 : 0}|${sdk ?? 'x'}`
}

/**
 * Асинхронное уточнение: Device.getInfo + (при смене) догрузка compat CSS.
 */
export async function runUiTierRefinement() {
  if (typeof window === 'undefined') {
    return
  }
  const w = window.innerWidth
  const h = window.innerHeight
  const device = await getDeviceInfoSafe()
  const { tier, legacy, androidSDK } = resolveTier(w, h, device)
  const key = snapshotKey(w, h, tier, legacy, androidSDK)
  if (key !== lastKey) {
    lastKey = key
    applyDocumentUi(tier, legacy, { androidSDK })
    writeSnapshot({ tier, legacy, w, h, androidSDK })
    void import('./loadCompatStyles').then(({ loadCompatStylesIfNeeded }) =>
      loadCompatStylesIfNeeded(tier, legacy),
    )
  }
  window.dispatchEvent(new CustomEvent('altapens-ui-tier', { detail: { tier, legacy, androidSDK } }))
}

export function getLastUiSnapshotKey() {
  return lastKey
}
