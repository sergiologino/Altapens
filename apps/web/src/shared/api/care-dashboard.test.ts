import type { SeniorOverview } from '@altapens/shared-types'
import { describe, expect, it } from 'vitest'
import {
  buildCaregiverDashboardFromApi,
  buildSeniorOverviewFromApi,
  summarizeMedicationLine,
} from '@/shared/api/care-dashboard'

describe('care-dashboard', () => {
  const caregiverSession = {
    id: 'u1',
    role: 'caregiver' as const,
    fullName: 'Анна Смирнова',
    email: 'a@test',
  }

  const apiSenior = {
    relationshipId: 'r1',
    userId: 's1',
    fullName: 'Иван Иванович',
    email: 'i@test',
    status: 'active' as const,
  }

  it('buildCaregiverDashboardFromApi maps seniors and caregiver display name', () => {
    const d = buildCaregiverDashboardFromApi(caregiverSession, [apiSenior])
    expect(d.seniors).toHaveLength(1)
    expect(d.seniors[0].fullName).toBe('Иван Иванович')
    expect(d.seniors[0].id).toBe('s1')
    expect(d.caregiver.displayName).toBe('Анна')
    expect(d.caregiver.contact).toBe('a@test')
  })

  it('buildCaregiverDashboardFromApi uses doses and checkins when insights passed', () => {
    const d = buildCaregiverDashboardFromApi(caregiverSession, [apiSenior], {
      s1: {
        doses: [
          {
            id: 'd1',
            title: 'Аспирин',
            dosageText: '1',
            instructions: 'После еды',
            plannedTime: '14:00',
            status: 'upcoming',
            confirmationRequired: false,
          },
        ],
        checkins: [
          {
            id: 'c1',
            seniorUserId: 's1',
            state: 'good',
            note: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    })
    expect(d.seniors[0].medicationProgress).toContain('принято 0')
    expect(d.seniors[0].currentState).toBe('Хорошо')
    expect(d.aiSummaries.some((x) => x.includes('самочувствие'))).toBe(true)
  })

  it('summarizeMedicationLine counts statuses', () => {
    const r = summarizeMedicationLine([
      {
        id: 'a',
        title: 'A',
        dosageText: '1',
        instructions: '',
        plannedTime: '08:00',
        status: 'taken',
        confirmationRequired: false,
      },
      {
        id: 'b',
        title: 'B',
        dosageText: '1',
        instructions: '',
        plannedTime: '20:00',
        status: 'missed',
        confirmationRequired: false,
      },
    ])
    expect(r.taken).toBe(1)
    expect(r.missed).toBe(1)
    expect(r.total).toBe(2)
    expect(r.progress).toContain('пропущено 1')
  })

  it('buildSeniorOverviewFromApi uses API doses when provided', () => {
    const seniorSession = {
      id: 's1',
      role: 'senior' as const,
      fullName: 'Иван Иванович',
      email: 'i@test',
    }
    const base: SeniorOverview = {
      senior: {
        id: 'x',
        fullName: 'x',
        age: 70,
        city: 'Город',
        timezone: 'Europe/Moscow',
        fontScalePreference: 'large',
        voiceEnabled: true,
      },
      todaySummary: 'старое',
      latestCheckin: { id: '1', dateLabel: 'Сегодня', state: 'good' },
      medications: [
        {
          id: 'm1',
          title: 'Старый',
          dosageText: '1',
          instructions: '',
          plannedTime: '00:00',
          status: 'taken',
          confirmationRequired: false,
        },
      ],
      alerts: [],
      assistantMessages: [],
    }
    const doses = [
      {
        id: 'd1',
        title: 'Новый',
        dosageText: '2 мг',
        instructions: 'Утром',
        plannedTime: '10:00',
        status: 'upcoming' as const,
        confirmationRequired: true,
      },
    ]
    const o = buildSeniorOverviewFromApi(seniorSession, [], base, doses)
    expect(o.medications).toHaveLength(1)
    expect(o.medications[0].title).toBe('Новый')
  })

  it('buildSeniorOverviewFromApi merges session and caregivers into summary', () => {
    const seniorSession = {
      id: 's1',
      role: 'senior' as const,
      fullName: 'Иван Иванович',
      email: 'i@test',
    }
    const base: SeniorOverview = {
      senior: {
        id: 'x',
        fullName: 'x',
        age: 70,
        city: 'Город',
        timezone: 'Europe/Moscow',
        fontScalePreference: 'large',
        voiceEnabled: true,
      },
      todaySummary: 'старое',
      latestCheckin: { id: '1', dateLabel: 'Сегодня', state: 'good' },
      medications: [],
      alerts: [],
      assistantMessages: [],
    }
    const o = buildSeniorOverviewFromApi(seniorSession, [apiSenior], base)
    expect(o.senior.fullName).toBe('Иван Иванович')
    expect(o.senior.id).toBe('s1')
    expect(o.todaySummary).toContain('С вами на связи')
  })
})
