import { describe, expect, it } from 'vitest'

import {
  calendarDayKey,
  isCurrentMinutePlanned,
  shouldNotifyMedicationDose,
} from '@/features/medication-reminders/medication-reminder-logic'

const baseDose = {
  id: 'm1:0',
  title: 'Тест',
  dosageText: '1 таб',
  instructions: '',
  plannedTime: '09:30',
  status: 'upcoming' as const,
  confirmationRequired: true,
}

describe('medication-reminder-logic', () => {
  it('calendarDayKey is stable', () => {
    const d = new Date(2026, 3, 15, 12, 0, 0)
    expect(calendarDayKey(d)).toBe('2026-04-15')
  })

  it('isCurrentMinutePlanned matches HH:MM', () => {
    const t = new Date(2026, 3, 15, 9, 30, 0)
    expect(isCurrentMinutePlanned('09:30', t)).toBe(true)
    expect(isCurrentMinutePlanned('9:30', t)).toBe(true)
    expect(isCurrentMinutePlanned('10:30', t)).toBe(false)
  })

  it('shouldNotify when upcoming, minute matches, not yet notified', () => {
    const now = new Date(2026, 3, 15, 9, 30, 5)
    expect(shouldNotifyMedicationDose(baseDose, now, new Set())).toBe(true)
  })

  it('should not notify twice same id', () => {
    const now = new Date(2026, 3, 15, 9, 30, 5)
    expect(shouldNotifyMedicationDose(baseDose, now, new Set(['m1:0']))).toBe(false)
  })

  it('should not notify if already missed', () => {
    const now = new Date(2026, 3, 15, 9, 30, 5)
    expect(
      shouldNotifyMedicationDose({ ...baseDose, status: 'missed' }, now, new Set()),
    ).toBe(false)
  })

  it('should not notify on wrong minute', () => {
    const now = new Date(2026, 3, 15, 10, 30, 0)
    expect(shouldNotifyMedicationDose(baseDose, now, new Set())).toBe(false)
  })
})
