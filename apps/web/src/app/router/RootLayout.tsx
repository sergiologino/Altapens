import { Outlet } from 'react-router-dom'
import { DocumentHead } from '@/app/seo/DocumentHead'
import { AppTopBar } from '@/shared/ui/AppTopBar'

export function RootLayout() {
  return (
    <>
      <DocumentHead />
      <AppTopBar />
      <Outlet />
    </>
  )
}
