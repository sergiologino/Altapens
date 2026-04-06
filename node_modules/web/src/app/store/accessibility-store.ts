import { create } from 'zustand'

type FontScale = 'normal' | 'large' | 'x-large'

interface AccessibilityState {
  fontScale: FontScale
  voiceEnabled: boolean
  highContrast: boolean
  setFontScale: (fontScale: FontScale) => void
  setVoiceEnabled: (voiceEnabled: boolean) => void
  setHighContrast: (highContrast: boolean) => void
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  fontScale: 'large',
  voiceEnabled: true,
  highContrast: false,
  setFontScale: (fontScale) => set({ fontScale }),
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  setHighContrast: (highContrast) => set({ highContrast }),
}))
