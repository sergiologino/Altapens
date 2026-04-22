import { useContext } from 'react'
import { UiTierContext } from './ui-tier-context'

export function useUiTier() {
  return useContext(UiTierContext)
}
