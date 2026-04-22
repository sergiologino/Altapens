import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme-dark.css'
import App from './App.tsx'
import { initColorSchemeFromStorage } from '@/app/store/ui-theme-store'
import { hideNativeSplashEarly } from '@/shared/lib/native-splash-hide'
import { ensureThemeVariables } from '@/shared/lib/theme'

initColorSchemeFromStorage()
ensureThemeVariables()
hideNativeSplashEarly()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
