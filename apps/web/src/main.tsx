import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { preflightDocumentUi } from '@/app/ui-tier/preflight'
import './index.css'
import './theme-dark.css'
import './app/ui-tier/ui-tier-base.css'
import App from './App.tsx'
import { initColorSchemeFromStorage } from '@/app/store/ui-theme-store'
import { hideNativeSplashEarly } from '@/shared/lib/native-splash-hide'
import { ensureThemeVariables } from '@/shared/lib/theme'

preflightDocumentUi()
initColorSchemeFromStorage()
ensureThemeVariables()
hideNativeSplashEarly()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
