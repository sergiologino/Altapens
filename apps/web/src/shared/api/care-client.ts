import {
  careInviteListSchema,
  careRelationshipSchema,
  careUserSummaryListSchema,
  createMedicationRequestSchema,
  medicationDoseListSchema,
  medicationListSchema,
  medicationResponseSchema,
  recordMedicationIntakeRequestSchema,
  recordWellbeingCheckinRequestSchema,
  timelineItemListSchema,
  wellbeingCheckinListSchema,
  wellbeingCheckinSchema,
  type CareInviteDto,
  type CareRelationshipDto,
  type CareUserSummaryDto,
  type CreateMedicationRequestDto,
  type MedicationDoseDto,
  type MedicationResponseDto,
  type RecordMedicationIntakeRequestDto,
  type RecordWellbeingCheckinRequestDto,
  type TimelineItemDto,
  type WellbeingCheckinDto,
} from '@altapens/api-contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/auth-store'
import { apiBaseUrl, useBackendApi } from '@/shared/api/api-base'

const parseJson = async <T>(response: Response, schema: { parse: (value: unknown) => T }) => {
  const payload = await response.json()
  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'Request failed'
    throw new Error(message)
  }
  return schema.parse(payload)
}

const withAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const medicationsQuery = (seniorUserId?: string) => {
  const q = seniorUserId
    ? `?seniorUserId=${encodeURIComponent(seniorUserId)}`
    : ''
  return q
}

const checkinsQuery = (seniorUserId: string | undefined, limit: number) => {
  const params = new URLSearchParams()
  if (seniorUserId) params.set('seniorUserId', seniorUserId)
  params.set('limit', String(limit))
  const s = params.toString()
  return s ? `?${s}` : ''
}

const timelineQuery = (seniorUserId: string | undefined, limit: number) => {
  const params = new URLSearchParams()
  if (seniorUserId) params.set('seniorUserId', seniorUserId)
  params.set('limit', String(limit))
  const s = params.toString()
  return s ? `?${s}` : ''
}

export const careQueryKeys = {
  seniors: ['care', 'seniors'] as const,
  caregivers: ['care', 'caregivers'] as const,
  invites: ['care', 'invites'] as const,
  relationship: (id: string) => ['care', 'relationship', id] as const,
  medications: (seniorUserId?: string) => ['care', 'medications', seniorUserId ?? 'self'] as const,
  todayDoses: (seniorUserId?: string) => ['care', 'today-doses', seniorUserId ?? 'self'] as const,
  checkins: (seniorUserId?: string) => ['care', 'checkins', seniorUserId ?? 'self'] as const,
  timeline: (seniorUserId?: string) => ['care', 'timeline', seniorUserId ?? 'self'] as const,
}

export interface CareApi {
  listSeniors: () => Promise<CareUserSummaryDto[]>
  listCaregivers: () => Promise<CareUserSummaryDto[]>
  listInvites: () => Promise<CareInviteDto[]>
  getRelationship: (id: string) => Promise<CareRelationshipDto>
  listMedications: (seniorUserId?: string) => Promise<MedicationResponseDto[]>
  listTodayDoses: (seniorUserId?: string) => Promise<MedicationDoseDto[]>
  createMedication: (body: CreateMedicationRequestDto) => Promise<MedicationResponseDto>
  listCheckins: (seniorUserId?: string, limit?: number) => Promise<WellbeingCheckinDto[]>
  createCheckin: (body: RecordWellbeingCheckinRequestDto) => Promise<WellbeingCheckinDto>
  listTimeline: (seniorUserId?: string, limit?: number) => Promise<TimelineItemDto[]>
  recordMedicationIntake: (body: RecordMedicationIntakeRequestDto) => Promise<void>
}

const httpCareApi: CareApi = {
  async listSeniors() {
    const response = await fetch(`${apiBaseUrl}/api/v1/care/seniors`, {
      headers: { ...withAuthHeaders() },
    })
    return parseJson(response, careUserSummaryListSchema)
  },
  async listCaregivers() {
    const response = await fetch(`${apiBaseUrl}/api/v1/care/caregivers`, {
      headers: { ...withAuthHeaders() },
    })
    return parseJson(response, careUserSummaryListSchema)
  },
  async listInvites() {
    const response = await fetch(`${apiBaseUrl}/api/v1/care/invites`, {
      headers: { ...withAuthHeaders() },
    })
    return parseJson(response, careInviteListSchema)
  },
  async getRelationship(id) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/relationships/${encodeURIComponent(id)}`,
      {
        headers: { ...withAuthHeaders() },
      },
    )
    return parseJson(response, careRelationshipSchema)
  },
  async listMedications(seniorUserId) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/medications${medicationsQuery(seniorUserId)}`,
      {
        headers: { ...withAuthHeaders(), 'Content-Type': 'application/json' },
      },
    )
    return parseJson(response, medicationListSchema)
  },
  async listTodayDoses(seniorUserId) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/medications/today-doses${medicationsQuery(seniorUserId)}`,
      {
        headers: { ...withAuthHeaders() },
      },
    )
    return parseJson(response, medicationDoseListSchema)
  },
  async createMedication(body) {
    const parsed = createMedicationRequestSchema.parse(body)
    const response = await fetch(`${apiBaseUrl}/api/v1/care/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...withAuthHeaders(),
      },
      body: JSON.stringify(parsed),
    })
    return parseJson(response, medicationResponseSchema)
  },
  async listCheckins(seniorUserId, limit = 30) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/checkins${checkinsQuery(seniorUserId, limit)}`,
      {
        headers: { ...withAuthHeaders() },
      },
    )
    return parseJson(response, wellbeingCheckinListSchema)
  },
  async createCheckin(body) {
    const parsed = recordWellbeingCheckinRequestSchema.parse(body)
    const response = await fetch(`${apiBaseUrl}/api/v1/care/checkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...withAuthHeaders(),
      },
      body: JSON.stringify(parsed),
    })
    return parseJson(response, wellbeingCheckinSchema)
  },
  async listTimeline(seniorUserId, limit = 30) {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/timeline${timelineQuery(seniorUserId, limit)}`,
      {
        headers: { ...withAuthHeaders() },
      },
    )
    return parseJson(response, timelineItemListSchema)
  },
  async recordMedicationIntake(body) {
    const parsed = recordMedicationIntakeRequestSchema.parse(body)
    const response = await fetch(`${apiBaseUrl}/api/v1/care/medications/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...withAuthHeaders(),
      },
      body: JSON.stringify(parsed),
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message =
        typeof payload?.message === 'string' ? payload.message : 'Request failed'
      throw new Error(message)
    }
  },
}

const notAvailable = async (): Promise<never> => {
  throw new Error('Care API доступен только при настроенном backend (VITE_API_BASE_URL или same-origin).')
}

const localCareApi: CareApi = {
  listSeniors: notAvailable,
  listCaregivers: notAvailable,
  listInvites: notAvailable,
  getRelationship: notAvailable,
  listMedications: notAvailable,
  listTodayDoses: notAvailable,
  createMedication: notAvailable,
  listCheckins: notAvailable,
  createCheckin: notAvailable,
  listTimeline: notAvailable,
  recordMedicationIntake: notAvailable,
}

export const careApi: CareApi = useBackendApi ? httpCareApi : localCareApi

const invalidateAfterMedicationChange = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['senior-overview'] })
  void queryClient.invalidateQueries({ queryKey: ['caregiver-dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['care', 'medications'] })
  void queryClient.invalidateQueries({ queryKey: ['care', 'today-doses'] })
  void queryClient.invalidateQueries({ queryKey: ['medication-history'] })
}

const invalidateAfterIntake = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateAfterMedicationChange(queryClient)
  void queryClient.invalidateQueries({ queryKey: ['timeline'] })
}

const invalidateAfterCheckin = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['senior-overview'] })
  void queryClient.invalidateQueries({ queryKey: ['caregiver-dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['checkins'] })
  void queryClient.invalidateQueries({ queryKey: ['timeline'] })
}

export const useCreateMedicationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMedicationRequestDto) => careApi.createMedication(body),
    onSuccess: () => invalidateAfterMedicationChange(queryClient),
  })
}

export const useRecordMedicationIntakeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RecordMedicationIntakeRequestDto) => careApi.recordMedicationIntake(body),
    onSuccess: () => invalidateAfterIntake(queryClient),
  })
}

export const useRecordWellbeingCheckinMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RecordWellbeingCheckinRequestDto) => careApi.createCheckin(body),
    onSuccess: () => invalidateAfterCheckin(queryClient),
  })
}
