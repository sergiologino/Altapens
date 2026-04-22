import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const IconOverview = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)

const IconPeople = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="9" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M4 18.25v-.75c0-2.2 2.25-4 5-4s5 1.8 5 4v.75"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="17" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M15 18.25h5v-.6c0-1.35-1.5-2.4-3.2-2.65"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const IconPill = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="4"
      y="9"
      width="16"
      height="6"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconCalendar = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconChat = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 5h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 3v-3H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)

const IconGear = () => (
  <svg className="caregiver-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <g stroke="currentColor" strokeWidth="1.65" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.25v2M12 19.75v2M2.25 12h2M19.75 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4" />
    </g>
  </svg>
)

type NavItem = { to: string; label: string; end?: boolean; icon: () => ReactNode }

const items: NavItem[] = [
  { to: '/caregiver', label: 'Обзор', end: true, icon: IconOverview },
  { to: '/caregiver/seniors', label: 'Подопечные', icon: IconPeople },
  { to: '/caregiver/medications/new', label: 'Лекарства', icon: IconPill },
  { to: '/caregiver/events', label: 'События', icon: IconCalendar },
  { to: '/caregiver/assistant', label: 'Помощник', icon: IconChat },
  { to: '/caregiver/settings', label: 'Настройки', icon: IconGear },
]

export function CaregiverBottomNav() {
  return (
    <nav className="caregiver-bottom-nav" aria-label="Разделы приложения">
      <div className="caregiver-bottom-nav-inner">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx('caregiver-bottom-nav-link', isActive && 'caregiver-bottom-nav-link-active')
            }
          >
            {item.icon()}
            <span className="caregiver-bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
