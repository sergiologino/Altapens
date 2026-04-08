import type { SeniorOverview } from '@altapens/shared-types'
import { describe, expect, it } from 'vitest'
import { buildCaregiverDashboardFromApi, buildSeniorOverviewFromApi } from '@/shared/api/care-dashboard'

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
      medications: [{ id: 'm1', title: 'Старый', dosageText: '1', plannedTime: '00:00', status: 'taken', confirmationRequired: false }],
      alerts: [],
      assistantMessages: [],
    }
    const doses = [
      {
        id: 'd1',
        title: 'Новый',
        dosageText: '2 мг',
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
