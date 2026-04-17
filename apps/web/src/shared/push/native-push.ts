import { registerDevicePushRequestSchema } from '@altapens/api-contracts'
import { apiBaseUrl } from '@/shared/api/api-base'

/**
 * Регистрация FCM/APNs токена в backend после входа (только нативная оболочка Capacitor).
 * В браузере не вызывается (isNativePlatform === false).
 */
export async function initNativePushAfterAuth(
  accessToken: string,
  signal: AbortSignal,
): Promise<void> {
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) {
    return
  }

  const { PushNotifications } = await import('@capacitor/push-notifications')

  let perm = await PushNotifications.checkPermissions()
  if (perm.receive === 'prompt') {
    perm = await PushNotifications.requestPermissions()
  }
  if (perm.receive !== 'granted' || signal.aborted) {
    return
  }

  const sendToken = async (rawToken: string) => {
    if (signal.aborted) return
    const platform = Capacitor.getPlatform()
    const parsedPlatform =
      platform === 'ios' || platform === 'android' || platform === 'web' ? platform : 'android'
    const body = registerDevicePushRequestSchema.parse({
      platform: parsedPlatform,
      token: rawToken,
    })
    const response = await fetch(`${apiBaseUrl}/api/v1/notifications/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })
    if (!response.ok && import.meta.env.DEV) {
      console.warn('[native-push] register device failed', response.status)
    }
  }

  await PushNotifications.removeAllListeners()

  await PushNotifications.addListener('registration', (t) => {
    void sendToken(t.value)
  })

  await PushNotifications.addListener('registrationError', (err) => {
    if (import.meta.env.DEV) {
      console.warn('[native-push] registrationError', err.error)
    }
  })

  const onAbort = () => {
    void PushNotifications.removeAllListeners()
  }
  signal.addEventListener('abort', onAbort, { once: true })

  await PushNotifications.register()
}
