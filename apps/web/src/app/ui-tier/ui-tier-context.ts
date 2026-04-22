import { createContext } from 'react'
import type { UiTier } from './types'

export type UiTierContextValue = {
  /** После первого refetch — совпадает с document.documentElement.dataset.uiTier */
  tier: UiTier
  /** Старые версии Android: упрощённые эффекты, чуть крупнее минимальные тапы */
  legacy: boolean
  refetch: () => Promise<void>
}

const defaultValue: UiTierContextValue = {
  tier: 'standard',
  legacy: false,
  refetch: async () => {},
}

export const UiTierContext = createContext<UiTierContextValue>(defaultValue)
