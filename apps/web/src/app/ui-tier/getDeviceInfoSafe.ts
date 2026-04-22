import { Capacitor } from '@capacitor/core'
import type { DeviceTierHints } from './types'

export async function getDeviceInfoSafe(): Promise<DeviceTierHints> {
  if (Capacitor.getPlatform() === 'web') {
    return null
  }
  try {
    const { Device } = await import('@capacitor/device')
    const info = await Device.getInfo()
    return {
      platform: info.platform,
      androidSDKVersion: info.androidSDKVersion,
    }
  } catch {
    return null
  }
}
