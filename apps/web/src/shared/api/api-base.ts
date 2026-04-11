/** Общие настройки HTTP к backend (совпадают с auth-client). */
export const sameOriginApi = import.meta.env.VITE_API_SAME_ORIGIN === 'true'
const rawBase = import.meta.env.VITE_API_BASE_URL
export const apiBaseUrl = sameOriginApi
  ? ''
  : (typeof rawBase === 'string' ? rawBase : '').replace(/\/$/, '')

export const useBackendApi = sameOriginApi || Boolean(apiBaseUrl)
