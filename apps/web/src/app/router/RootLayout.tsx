import { Outlet } from 'react-router-dom'
import { DocumentHead } from '@/app/seo/DocumentHead'

export function RootLayout() {
  return (
    <>
      <DocumentHead />
      <Outlet />
    </>
  )
}
