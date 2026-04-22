import {
  createDonationRequestSchema,
  createDonationResponseSchema,
  donationStatusResponseSchema,
  type CreateDonationRequestDto,
  type CreateDonationResponseDto,
  type DonationStatusResponseDto,
} from '@altapens/api-contracts'
import { useAuthStore } from '@/app/store/auth-store'
import { apiBaseUrl, useBackendApi } from '@/shared/api/api-base'
import { appFetch } from '@/shared/api/app-fetch'

const parseJson = async <T>(response: Response, schema: { parse: (value: unknown) => T }) => {
  const text = await response.text()
  let payload: unknown
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    const hint = text?.trim() || `HTTP ${response.status}`
    throw new Error(hint)
  }
  if (!response.ok) {
    const p = payload as { message?: string; details?: string[] }
    let message = typeof p.message === 'string' ? p.message : 'Не удалось выполнить запрос'
    if (p.details && p.details.length > 0 && (message === 'Validation failed' || message === 'Constraint violation')) {
      message = p.details[0]
    }
    throw new Error(message)
  }
  return schema.parse(payload)
}

const withAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isDonationsApiAvailable(): boolean {
  return useBackendApi
}

export async function createDonation(
  payload: CreateDonationRequestDto,
): Promise<CreateDonationResponseDto> {
  if (!useBackendApi) {
    throw new Error(
      'Донаты доступны при подключённом сервере. Укажите VITE_API_BASE_URL или VITE_API_SAME_ORIGIN.',
    )
  }
  const body = createDonationRequestSchema.parse(payload)
  const response = await appFetch(`${apiBaseUrl}/api/v1/payments/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    body: JSON.stringify(body),
  })
  return parseJson(response, createDonationResponseSchema)
}

export async function getDonationStatus(donationId: string): Promise<DonationStatusResponseDto> {
  if (!useBackendApi) {
    throw new Error('API недоступен')
  }
  const response = await appFetch(
    `${apiBaseUrl}/api/v1/payments/donations/${encodeURIComponent(donationId)}/status`,
  )
  return parseJson(response, donationStatusResponseSchema)
}
