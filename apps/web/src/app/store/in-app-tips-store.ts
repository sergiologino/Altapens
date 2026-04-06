import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@altapens/shared-types'

/**
 * Увеличьте, чтобы снова показать блок «первый вход» всем пользователям
 * (после крупных изменений в навигации или текстах).
 */
export const APP_IN_APP_TIPS_VERSION = 1

type TipsRole = Extract<UserRole, 'caregiver' | 'senior'>

interface InAppTipsState {
  /** Версия подсказок, уже просмотренная для роли (0 = не закрывали). */
  versionSeenByRole: Record<TipsRole, number>
  markTipsSeen: (role: TipsRole) => void
}

const initialSeen: Record<TipsRole, number> = {
  caregiver: 0,
  senior: 0,
}

export const useInAppTipsStore = create<InAppTipsState>()(
  persist(
    (set) => ({
      versionSeenByRole: { ...initialSeen },
      markTipsSeen: (role) =>
        set((state) => ({
          versionSeenByRole: {
            ...state.versionSeenByRole,
            [role]: APP_IN_APP_TIPS_VERSION,
          },
        })),
    }),
    { name: 'altapens-in-app-tips' },
  ),
)

export const shouldShowInAppTips = (versionSeen: number) =>
  versionSeen < APP_IN_APP_TIPS_VERSION
