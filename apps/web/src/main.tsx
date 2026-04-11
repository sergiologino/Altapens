import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme-dark.css'
import App from './App.tsx'
import { initColorSchemeFromStorage } from '@/app/store/ui-theme-store'
import { ensureThemeVariables } from '@/shared/lib/theme'

initColorSchemeFromStorage()
ensureThemeVariables()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
