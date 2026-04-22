import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { useAuthStore } from '@/app/store/auth-store'
import { YandexMetrika } from '@/shared/analytics/YandexMetrika'
import { useBackendApi } from '@/shared/api/api-base'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
})

function NativePushBridge() {
  const useBackend = useBackendApi
  const session = useAuthStore((s) => s.session)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!useBackend || !session || !accessToken) {
      return
    }
    const ac = new AbortController()
    void import('@/shared/push/native-push').then(({ initNativePushAfterAuth }) =>
      initNativePushAfterAuth(accessToken, ac.signal),
    )
    return () => ac.abort()
  }, [useBackend, session, accessToken])

  return null
}

export const AppProviders = ({ children }: PropsWithChildren) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <YandexMetrika />
      <NativePushBridge />
      {children}
    </QueryClientProvider>
  </HelmetProvider>
)
