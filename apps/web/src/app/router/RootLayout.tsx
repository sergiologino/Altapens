import { Outlet, useLocation } from 'react-router-dom'
import { DocumentHead } from '@/app/seo/DocumentHead'
import { AppTopBar } from '@/shared/ui/AppTopBar'

export function RootLayout() {
  const { pathname } = useLocation()
  const onboardingOnly = pathname === '/welcome'

  return (
    <>
      <DocumentHead />
      {onboardingOnly ? null : <AppTopBar />}
      <Outlet />
    </>
  )
}
