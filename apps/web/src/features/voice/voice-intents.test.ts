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
  instructions: 'После еды',
  plannedTime: '09:00',
  status: 'upcoming',
  confirmationRequired: true,
}

const doses = [dose0]

const magB6: MedicationDose = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901:0',
  title: 'Магний B6',
  dosageText: '1 таблетка',
  instructions: 'После еды',
  plannedTime: '14:00',
  status: 'upcoming',
  confirmationRequired: true,
}

describe('parseTranscriptToIntent', () => {
  it('detects taken with drug name', () => {
    expect(parseTranscriptToIntent('я выпил конкор', doses)).toEqual({
      type: 'medication',
      doseIds: [dose0.id],
      action: 'taken',
    })
  })

  it('matches Latin B6 in catalog with Cyrillic б6 in speech', () => {
    expect(parseTranscriptToIntent('принял магний б6', [magB6])).toEqual({
      type: 'medication',
      doseIds: [magB6.id],
      action: 'taken',
    })
  })

  it('does not treat "не принял" as taken', () => {
    expect(parseTranscriptToIntent('не принял конкор', doses)).toEqual({
      type: 'medication',
      doseIds: [dose0.id],
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

  it('medication_not_recognized without api dose id', () => {
    const localDoses: MedicationDose[] = [
      { ...dose0, id: 'dose-mock' },
    ]
    expect(parseTranscriptToIntent('выпил конкор', localDoses)).toEqual({
      type: 'medication_not_recognized',
    })
  })

  const konkor9: MedicationDose = {
    id: 'c1c2d3d4-e5f6-7890-abcd-ef1234567890:0',
    title: 'Конкор',
    dosageText: '5 мг',
    instructions: '',
    plannedTime: '09:00',
    status: 'upcoming',
    confirmationRequired: true,
  }

  const konkor14: MedicationDose = {
    id: 'c1c2d3d4-e5f6-7890-abcd-ef1234567890:1',
    title: 'Конкор',
    dosageText: '5 мг',
    instructions: '',
    plannedTime: '14:00',
    status: 'upcoming',
    confirmationRequired: true,
  }

  it('picks nearest slot by time of day (15:00 → 14:00 slot)', () => {
    const at = new Date(2026, 3, 15, 15, 0, 0)
    expect(parseTranscriptToIntent('принял конкор', [konkor9, konkor14], { at })).toEqual({
      type: 'medication',
      doseIds: [konkor14.id],
      action: 'taken',
    })
  })

  it('marks two times for one drug', () => {
    expect(parseTranscriptToIntent('принял конкор в 9 и в 14', [konkor9, konkor14])).toEqual({
      type: 'medication',
      doseIds: [konkor9.id, konkor14.id],
      action: 'taken',
    })
  })

  it('marks morning and afternoon by words', () => {
    expect(parseTranscriptToIntent('принял конкор утром и днем', [konkor9, konkor14])).toEqual({
      type: 'medication',
      doseIds: [konkor9.id, konkor14.id],
      action: 'taken',
    })
  })

  it('drug_name_repeat: name only without принял', () => {
    const at = new Date(2026, 3, 15, 15, 0, 0)
    expect(
      parseTranscriptToIntent('конкор', [konkor9, konkor14], {
        mode: 'drug_name_repeat',
        at,
      }),
    ).toEqual({
      type: 'medication',
      doseIds: [konkor14.id],
      action: 'taken',
    })
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
