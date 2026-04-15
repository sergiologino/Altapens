import type { HealthState } from '@altapens/shared-types'

export type MedicationVoiceAction = 'taken' | 'missed' | 'snoozed'

export type VoiceIntent =
  | { type: 'navigate_sos' }
  | { type: 'checkin'; state: HealthState; note?: string }
  | { type: 'vitals_note'; note: string }
  | { type: 'medication'; doseIds: string[]; action: MedicationVoiceAction }
  | { type: 'confirm_yes' }
  | { type: 'unknown' }
  | { type: 'medication_not_recognized' }

export type PendingVoiceAction =
  | { kind: 'medication'; doseId: string; action: 'missed' | 'snoozed'; title: string }
  | { kind: 'drug_name_retry'; action: MedicationVoiceAction }
  | null
