import { getThemeStyleText } from '@altapens/design-tokens'

const THEME_STYLE_ID = 'altapens-theme-tokens'

export const ensureThemeVariables = () => {
  if (typeof document === 'undefined') {
    return
  }

  const existing = document.getElementById(THEME_STYLE_ID)
  if (existing) {
    return
  }

  const style = document.createElement('style')
  style.id = THEME_STYLE_ID
  style.textContent = getThemeStyleText()
  document.head.appendChild(style)
}
