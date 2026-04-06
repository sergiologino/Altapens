import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Увеличьте, чтобы показать онбординг снова всем после крупного обновления. */
export const APP_ONBOARDING_VERSION = 1

interface OnboardingState {
  /** Последняя просмотренная версия онбординга; 0 = не видели. */
  versionSeen: number
  markOnboardingComplete: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      versionSeen: 0,
      markOnboardingComplete: () => set({ versionSeen: APP_ONBOARDING_VERSION }),
    }),
    { name: 'altapens-onboarding' },
  ),
)
