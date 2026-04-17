import type { PropsWithChildren, ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BrandLogo } from '@/shared/ui/BrandLogo'

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export const AppShell = ({
  children,
  role,
  nav,
  mainClassName,
}: PropsWithChildren<{
  role: 'senior' | 'caregiver'
  nav: ReactNode
  mainClassName?: string
}>) => (
  <div className={cx('app-shell', role === 'senior' ? 'shell-senior' : 'shell-caregiver')}>
    <div className="decor-orb decor-orb-primary" aria-hidden="true" />
    <div className="decor-orb decor-orb-secondary" aria-hidden="true" />
    <div className="shell-grid">
      <aside className="shell-nav">{nav}</aside>
      <main className={cx('shell-main', mainClassName)}>{children}</main>
    </div>
  </div>
)

export const ShellNav = ({
  title,
  subtitle,
  links,
  footer,
}: {
  title: string
  subtitle: string
  links: Array<{ to: string; label: string }>
  footer?: ReactNode
}) => (
  <div className="surface-card nav-card">
    <div className="nav-copy">
      <div className="nav-brand-mark" aria-hidden="true">
        <BrandLogo size={44} />
      </div>
      <span className="eyebrow">AltaPens</span>
      <h1 className="nav-title">{title}</h1>
      <p className="nav-subtitle">{subtitle}</p>
    </div>
    <nav className="nav-links" aria-label={title}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/senior' || link.to === '/caregiver'}
          className={({ isActive }) => cx('nav-link', isActive && 'nav-link-active')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
    {footer ? <div className="nav-footer">{footer}</div> : null}
  </div>
)

export const SectionCard = ({
  children,
  tone = 'default',
  className,
}: PropsWithChildren<{ tone?: 'default' | 'accent' | 'warm'; className?: string }>) => (
  <section className={cx('surface-card', `surface-${tone}`, className)}>{children}</section>
)

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) => (
  <div className="section-header">
    <div>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
    {action ? <div className="section-action">{action}</div> : null}
  </div>
)

export const Pill = ({
  tone,
  children,
}: PropsWithChildren<{ tone: 'calm' | 'watch' | 'urgent' | 'accent' }>) => (
  <span className={cx('pill', `pill-${tone}`)}>{children}</span>
)

export const ActionLink = ({
  to,
  children,
  tone = 'primary',
}: PropsWithChildren<{ to: string; tone?: 'primary' | 'secondary' | 'ghost' | 'danger' }>) => (
  <Link className={cx('button-link', `button-${tone}`)} to={to}>
    {children}
  </Link>
)

export const ActionButton = ({
  type = 'button',
  tone = 'primary',
  className,
  children,
  ...props
}: PropsWithChildren<
  {
    type?: 'button' | 'submit' | 'reset'
    tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
    className?: string
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>) => (
  <button className={cx('button-link', `button-${tone}`, className)} type={type} {...props}>
    {children}
  </button>
)

export const MetricTile = ({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'accent' | 'warm' | 'neutral'
}) => (
  <div className={cx('metric-tile', `metric-${tone}`)}>
    <span className="metric-label">{label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
)

export const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="detail-row">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
)

export const EmptyState = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
)
