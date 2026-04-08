import { create } from 'zustand'

export const THEME_STORAGE_KEY = 'altapens-color-scheme'

export type ColorScheme = 'light' | 'dark'

export function applyColorScheme(scheme: ColorScheme): void {
  if (typeof document === 'undefined') return
  if (scheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

function readStoredScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light'
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function persistScheme(scheme: ColorScheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, scheme)
  } catch {
    /* ignore */
  }
}

/** Вызвать до первого рендера (main.tsx), чтобы не было вспышки светлой темы. */
export function initColorSchemeFromStorage(): void {
  applyColorScheme(readStoredScheme())
}

interface UiThemeState {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
}

export const useUiThemeStore = create<UiThemeState>((set) => ({
  colorScheme: readStoredScheme(),
  setColorScheme: (colorScheme) => {
    persistScheme(colorScheme)
    applyColorScheme(colorScheme)
    set({ colorScheme })
  },
}))
