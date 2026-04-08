import type { MedicationDose } from '@altapens/shared-types'
import { describe, expect, it } from 'vitest'
import {
  isApiDoseId,
  parseDoseSlotId,
  parseTranscriptToIntent,
} from '@/features/voice/voice-intents'

const dose0: MedicationDose = {
  id: 'a1b2d3c4-e5f6-7890-abcd-ef1234567890:0',
  title: 'Конкор',
  dosageText: '5 мг',
  plannedTime: '09:00',
  status: 'upcoming',
  confirmationRequired: true,
}

const doses = [dose0]

describe('parseTranscriptToIntent', () => {
  it('detects taken with drug name', () => {
    expect(parseTranscriptToIntent('я выпил конкор', doses)).toEqual({
      type: 'medication',
      doseId: dose0.id,
      action: 'taken',
    })
  })

  it('does not treat "не принял" as taken', () => {
    expect(parseTranscriptToIntent('не принял конкор', doses)).toEqual({
      type: 'medication',
      doseId: dose0.id,
      action: 'missed',
    })
  })

  it('detects SOS', () => {
    expect(parseTranscriptToIntent('позвони дочери', doses)).toEqual({ type: 'navigate_sos' })
  })

  it('detects vitals note', () => {
    const r = parseTranscriptToIntent('давление 120 на 80', doses)
    expect(r.type).toBe('vitals_note')
    if (r.type === 'vitals_note') {
      expect(r.note).toMatch(/120/)
    }
  })

  it('detects checkin good', () => {
    expect(parseTranscriptToIntent('мне хорошо', doses)).toEqual({
      type: 'checkin',
      state: 'good',
    })
  })

  it('confirm yes', () => {
    expect(parseTranscriptToIntent('да', doses)).toEqual({ type: 'confirm_yes' })
  })

  it('unknown without api dose id', () => {
    const localDoses: MedicationDose[] = [
      { ...dose0, id: 'dose-mock' },
    ]
    expect(parseTranscriptToIntent('выпил конкор', localDoses)).toEqual({ type: 'unknown' })
  })
})

describe('dose id helpers', () => {
  it('isApiDoseId', () => {
    expect(isApiDoseId('a1b2d3c4-e5f6-7890-abcd-ef1234567890:0')).toBe(true)
    expect(isApiDoseId('dose-1')).toBe(false)
  })

  it('parseDoseSlotId', () => {
    expect(parseDoseSlotId('a1b2d3c4-e5f6-7890-abcd-ef1234567890:0')).toEqual({
      medicationId: 'a1b2d3c4-e5f6-7890-abcd-ef1234567890',
      slotIndex: 0,
    })
  })
})
