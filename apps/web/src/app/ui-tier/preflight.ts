import { applyDocumentUi } from './applyDocumentUi'
import { readCachedSnapshot, resolveTierFromViewport } from './resolveTier'

/**
 * Синхронно до paint React: вьюпорт + (если подходит) кэш прошлой сессии.
 * Вызывать первой строкой в `main.tsx`.
 */
export function preflightDocumentUi() {
  if (typeof window === 'undefined') {
    return
  }
  const w = window.innerWidth
  const h = window.innerHeight
  const cached = readCachedSnapshot(w, h)
  const { tier, legacy } = cached ?? resolveTierFromViewport(w, h)
  applyDocumentUi(tier, legacy)
  if (tier !== 'standard' || legacy) {
    void import('./loadCompatStyles').then(({ loadCompatStylesIfNeeded }) =>
      loadCompatStylesIfNeeded(tier, legacy),
    )
  }
}
