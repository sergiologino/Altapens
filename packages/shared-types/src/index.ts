export type UserRole = 'senior' | 'caregiver'

export type HealthState = 'good' | 'need_help' | 'bad'

export type AttentionLevel = 'calm' | 'watch' | 'urgent'

export type InviteStatus = 'active' | 'accepted'

export interface AuthUser {
  id: string
  role: UserRole
  fullName: string
  email: string
  phone?: string
}

export interface CareRelationship {
  id: string
  seniorUserId: string
  caregiverUserId: string
  status: 'active'
}

export interface CareInvite {
  id: string
  code: string
  createdByUserId: string
  createdByName: string
  targetRole: UserRole
  status: InviteStatus
  expiresAt: string
  note?: string
  acceptedByUserId?: string
}

export interface SeniorProfile {
  id: string
  fullName: string
  age: number
  city: string
  timezone: string
  fontScalePreference: 'normal' | 'large' | 'x-large'
  voiceEnabled: boolean
}

export interface CaregiverProfile {
  id: string
  displayName: string
  relationshipType: string
  contact: string
}

export interface MedicationDose {
  id: string
  title: string
  dosageText: string
  plannedTime: string
  status: 'upcoming' | 'taken' | 'missed' | 'snoozed'
  confirmationRequired: boolean
}

export interface CheckinEntry {
  id: string
  dateLabel: string
  state: HealthState
  note?: string
}

export interface AlertItem {
  id: string
  title: string
  description: string
  level: AttentionLevel
  timeLabel: string
}

export interface AssistantMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export interface SeniorOverview {
  senior: SeniorProfile
  todaySummary: string
  latestCheckin: CheckinEntry
  medications: MedicationDose[]
  alerts: AlertItem[]
  assistantMessages: AssistantMessage[]
}

export interface CaregiverSeniorSummary {
  id: string
  fullName: string
  age: number
  currentState: string
  attentionLevel: AttentionLevel
  medicationProgress: string
  nextReminder: string
}

export interface CaregiverDashboard {
  caregiver: CaregiverProfile
  seniors: CaregiverSeniorSummary[]
  attentionItems: AlertItem[]
  aiSummaries: string[]
  todayMetrics: Array<{
    label: string
    value: string
    tone: 'accent' | 'warm' | 'neutral'
  }>
}

export interface MedicationFormValues {
  title: string
  dosageText: string
  instructions: string
  exactTimes: string
  daysOfWeek: string
  confirmationRequired: boolean
  notifyOnMissed: boolean
}
