import { Capacitor } from '@capacitor/core'

function headersToRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const out: Record<string, string> = {}
    headers.forEach((v, k) => {
      out[k] = v
    })
    return out
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }
  return headers as Record<string, string>
}

async function nativeHttpFetch(url: string, init?: RequestInit): Promise<Response> {
  const { Http } = await import('@capacitor-community/http')
  const method = (init?.method ?? 'GET').toUpperCase()
  const headers = headersToRecord(init?.headers)
  let data: string | undefined
  if (init?.body != null) {
    if (typeof init.body !== 'string') {
      throw new Error('appFetch: только строковое тело запроса (JSON.stringify)')
    }
    data = init.body
  }
  const res = await Http.request({
    url,
    method,
    headers,
    /** Android @capacitor-community/http: без объекта params native вызывает params.keys() на null → NPE */
    params: {},
    data,
    responseType: 'text',
  })
  const text =
    typeof res.data === 'string'
      ? res.data
      : res.data != null
        ? JSON.stringify(res.data)
        : ''
  const responseHeaders = new Headers()
  for (const [k, v] of Object.entries(res.headers ?? {})) {
    if (typeof v === 'string') {
      responseHeaders.set(k, v)
    }
  }
  return new Response(text, { status: res.status, headers: responseHeaders })
}

/**
 * В WebView Capacitor origin — https://localhost, из‑за чего fetch на внешний API режет CORS.
 * На нативных платформах запрос уходит через плагин HTTP без ограничений браузера.
 */
export function appFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString()
  if (Capacitor.isNativePlatform()) {
    return nativeHttpFetch(url, init)
  }
  return fetch(url, init)
}
