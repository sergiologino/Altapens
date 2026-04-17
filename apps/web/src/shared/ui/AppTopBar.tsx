import { Link } from 'react-router-dom'
import { BrandLogo } from '@/shared/ui/BrandLogo'

export function AppTopBar() {
  return (
    <header className="app-topbar" role="banner">
      <Link to="/" className="app-topbar-brand">
        <BrandLogo size={36} />
        <span className="app-topbar-title">AltaPens</span>
      </Link>
      <Link to="/donate" className="button-link button-secondary app-topbar-donate">
        Поддержать проект
      </Link>
    </header>
  )
}
