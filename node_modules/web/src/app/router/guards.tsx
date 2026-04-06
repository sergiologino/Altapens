import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '@altapens/shared-types'
import { APP_ONBOARDING_VERSION, useOnboardingStore } from '@/app/store/onboarding-store'
import { roleHomePath, useAuthStore } from '@/app/store/auth-store'

export const AppEntryPage = () => {
  const session = useAuthStore((state) => state.session)
  const versionSeen = useOnboardingStore((state) => state.versionSeen)

  if (session) {
    return <Navigate replace to={roleHomePath(session.role)} />
  }

  if (versionSeen < APP_ONBOARDING_VERSION) {
    return <Navigate replace to="/welcome" />
  }

  return <Navigate replace to="/start" />
}

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const session = useAuthStore((state) => state.session)

  if (session) {
    return <Navigate replace to={roleHomePath(session.role)} />
  }

  return <>{children}</>
}

export const RequireRole = ({
  role,
  children,
}: PropsWithChildren<{ role: UserRole }>) => {
  const session = useAuthStore((state) => state.session)
  const location = useLocation()

  if (!session) {
    const next = encodeURIComponent(location.pathname)
    return <Navigate replace to={`/auth/login?role=${role}&next=${next}`} />
  }

  if (session.role !== role) {
    return <Navigate replace to={roleHomePath(session.role)} />
  }

  return <>{children}</>
}
