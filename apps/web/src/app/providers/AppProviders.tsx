import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { YandexMetrika } from '@/shared/analytics/YandexMetrika'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
})

export const AppProviders = ({ children }: PropsWithChildren) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <YandexMetrika />
      {children}
    </QueryClientProvider>
  </HelmetProvider>
)
