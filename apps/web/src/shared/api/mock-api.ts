import type { WellbeingCheckinDto } from '@altapens/api-contracts'
import type { CheckinEntry } from '@altapens/shared-types'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/auth-store'
import { useBackendApi } from '@/shared/api/api-base'
import { buildCaregiverDashboardFromApi, buildSeniorOverviewFromApi } from '@/shared/api/care-dashboard'
import { careApi, careQueryKeys } from '@/shared/api/care-client'
import {
  caregiverDashboardMock,
  checkinsMock,
  medicationHistoryMock,
  seniorOverviewMock,
  timelineMock,
} from '@/shared/api/mock-care-data'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mapWellbeingCheckinToEntry = (d: WellbeingCheckinDto): CheckinEntry => ({
  id: d.id,
  dateLabel: new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(d.createdAt),
  ),
  state: d.state,
  note: d.note ?? undefined,
})

export const mockApi = {
  async getSeniorOverview() {
    await sleep(120)
    return seniorOverviewMock
  },
  async getCaregiverDashboard() {
    await sleep(140)
    return caregiverDashboardMock
  },
  async getMedicationHistory() {
    await sleep(100)
    return medicationHistoryMock
  },
  async getTimeline() {
    await sleep(100)
    return timelineMock
  },
  async getCheckins() {
    await sleep(100)
    return checkinsMock
  },
}

export const useSeniorOverviewQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: ['senior-overview', useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: async () => {
      if (!useHttp || session?.role !== 'senior') {
        return mockApi.getSeniorOverview()
      }
      const [caregivers, doses] = await Promise.all([
        careApi.listCaregivers(),
        careApi.listTodayDoses(),
      ])
      return buildSeniorOverviewFromApi(session, caregivers, seniorOverviewMock, doses)
    },
    enabled: !useHttp || session?.role === 'senior',
    staleTime: useHttp ? 60_000 : Infinity,
  })
}

export const useCaregiverDashboardQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: ['caregiver-dashboard', useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: async () => {
      if (!useHttp || session?.role !== 'caregiver') {
        return mockApi.getCaregiverDashboard()
      }
      const seniors = await careApi.listSeniors()
      return buildCaregiverDashboardFromApi(session, seniors)
    },
    enabled: !useHttp || session?.role === 'caregiver',
    staleTime: useHttp ? 60_000 : Infinity,
  })
}

export const useMedicationHistoryQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: ['medication-history', useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: async () => {
      if (!useHttp || session?.role !== 'senior') {
        return mockApi.getMedicationHistory()
      }
      return careApi.listTodayDoses()
    },
    enabled: !useHttp || session?.role === 'senior',
    staleTime: useHttp ? 60_000 : Infinity,
  })
}

export const useTimelineQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: ['timeline', useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: async () => {
      if (!useHttp || session?.role !== 'caregiver') {
        return mockApi.getTimeline()
      }
      const seniors = await careApi.listSeniors()
      const id = seniors[0]?.userId
      if (!id) {
        return []
      }
      return careApi.listTimeline(id)
    },
    enabled: session?.role === 'caregiver',
    staleTime: useHttp ? 60_000 : Infinity,
  })
}

export const useCheckinsQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: ['checkins', useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: async () => {
      if (!useHttp || session?.role !== 'senior') {
        return mockApi.getCheckins()
      }
      const rows = await careApi.listCheckins()
      return rows.map(mapWellbeingCheckinToEntry)
    },
    enabled: !useHttp || session?.role === 'senior',
    staleTime: useHttp ? 60_000 : Infinity,
  })
}

/** Список приглашений опекуна с backend (GET /care/invites). Локальный режим — пустой массив (см. store). */
export const useCareInvitesRemoteQuery = () => {
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi

  return useQuery({
    queryKey: [...careQueryKeys.invites, useHttp ? 'http' : 'local', session?.id ?? 'anon'],
    queryFn: () => careApi.listInvites(),
    enabled: useHttp && session?.role === 'caregiver',
    staleTime: 30_000,
  })
}
