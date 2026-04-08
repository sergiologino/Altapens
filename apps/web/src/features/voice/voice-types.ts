import type { HealthState } from '@altapens/shared-types'

export type MedicationVoiceAction = 'taken' | 'missed' | 'snoozed'

export type VoiceIntent =
  | { type: 'navigate_sos' }
  | { type: 'checkin'; state: HealthState; note?: string }
  | { type: 'vitals_note'; note: string }
  | { type: 'medication'; doseId: string; action: MedicationVoiceAction }
  | { type: 'confirm_yes' }
  | { type: 'unknown' }

export type PendingVoiceAction =
  | { kind: 'medication'; doseId: string; action: 'missed' | 'snoozed'; title: string }
  | null
