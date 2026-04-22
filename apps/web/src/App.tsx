import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router'
import { LaunchSplashGate } from '@/features/launch'

function App() {
  return (
    <AppProviders>
      <LaunchSplashGate>
        <AppRouter />
      </LaunchSplashGate>
    </AppProviders>
  )
}

export default App
