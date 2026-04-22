import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { runUiTierRefinement } from './runUiTierRefinement'
import { UiTierContext } from './ui-tier-context'
import type { UiTier } from './types'

function readTierFromDom(): { tier: UiTier; legacy: boolean } {
  if (typeof document === 'undefined') {
    return { tier: 'standard', legacy: false }
  }
  const t = (document.documentElement.dataset.uiTier as UiTier | undefined) ?? 'standard'
  const tier: UiTier =
    t === 'cozy' || t === 'compact' || t === 'standard' ? t : 'standard'
  const legacy = document.documentElement.hasAttribute('data-ui-legacy')
  return { tier, legacy }
}

export function UiTierProvider({ children }: PropsWithChildren) {
  const [{ tier, legacy }, setState] = useState(readTierFromDom)

  const refetch = useCallback(async () => {
    await runUiTierRefinement()
    setState(readTierFromDom())
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void refetch()
    })
  }, [refetch])

  useEffect(() => {
    const onResize = () => {
      void (async () => {
        await runUiTierRefinement()
        setState(readTierFromDom())
      })()
    }
    let t: number
    const debounced = () => {
      window.clearTimeout(t)
      t = window.setTimeout(onResize, 200)
    }
    window.addEventListener('resize', debounced, { passive: true })
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void onResize()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('resize', debounced)
      document.removeEventListener('visibilitychange', onVis)
      window.clearTimeout(t)
    }
  }, [])

  const value = useMemo(() => ({ tier, legacy, refetch }), [tier, legacy, refetch])

  return <UiTierContext.Provider value={value}>{children}</UiTierContext.Provider>
}
