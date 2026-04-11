import { z } from 'zod'

export const userRoleSchema = z.enum(['senior', 'caregiver'])

export const authUserSchema = z.object({
  id: z.string(),
  role: userRoleSchema,
  fullName: z.string(),
  email: z.email(),
  phone: z.string().optional(),
})

export const authActionResultSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
})

export const loginRequestSchema = z.object({
  role: userRoleSchema,
  email: z.email(),
  password: z.string().min(4),
})

export const loginResponseSchema = z.object({
  result: authActionResultSchema,
  session: authUserSchema.nullable(),
  accessToken: z.string().optional(),
})

export const registerRequestSchema = z.object({
  role: userRoleSchema,
  fullName: z.string().min(3),
  email: z.email(),
  phone: z.string().min(8),
  password: z.string().min(4),
  inviteCode: z.string().optional(),
})

export const registerResponseSchema = z.object({
  result: authActionResultSchema,
  session: authUserSchema.nullable(),
  accessToken: z.string().optional(),
})

export const inviteStatusSchema = z.enum(['active', 'accepted'])

export const careInviteSchema = z.object({
  id: z.string(),
  code: z.string(),
  createdByUserId: z.string(),
  createdByName: z.string(),
  targetRole: userRoleSchema,
  status: inviteStatusSchema,
  expiresAt: z.string(),
  note: z.string().optional(),
  acceptedByUserId: z.string().optional(),
})

export const createInviteRequestSchema = z.object({
  targetRole: userRoleSchema,
  note: z.string().optional(),
})

export const createInviteResponseSchema = z.object({
  invite: careInviteSchema,
})

export const lookupInviteResponseSchema = z.object({
  invite: careInviteSchema.nullable(),
})

export const acceptInviteRequestSchema = z.object({
  code: z.string().min(4),
})

export const acceptInviteResponseSchema = z.object({
  result: authActionResultSchema,
})

export const careRelationshipSchema = z.object({
  id: z.string(),
  seniorUserId: z.string(),
  caregiverUserId: z.string(),
  status: z.literal('active'),
})

/** Элемент списка GET /care/seniors и GET /care/caregivers */
export const careUserSummarySchema = z.object({
  relationshipId: z.string(),
  userId: z.string(),
  fullName: z.string(),
  email: z.string(),
  status: z.literal('active'),
})

export const careUserSummaryListSchema = z.array(careUserSummarySchema)

export const careInviteListSchema = z.array(careInviteSchema)

export const medicationDoseStatusSchema = z.enum(['upcoming', 'taken', 'missed', 'snoozed'])

export const medicationDoseSchema = z.object({
  id: z.string(),
  title: z.string(),
  dosageText: z.string(),
  /** Как принимать: видно подопечному и куратору */
  instructions: z.string(),
  plannedTime: z.string(),
  status: medicationDoseStatusSchema,
  confirmationRequired: z.boolean(),
})

export const medicationDoseListSchema = z.array(medicationDoseSchema)

export const medicationResponseSchema = z.object({
  id: z.string(),
  seniorUserId: z.string(),
  title: z.string(),
  dosageText: z.string(),
  instructions: z.string(),
  exactTimes: z.string(),
  daysOfWeek: z.string(),
  confirmationRequired: z.boolean(),
  notifyOnMissed: z.boolean(),
})

export const medicationListSchema = z.array(medicationResponseSchema)

export const createMedicationRequestSchema = z.object({
  seniorUserId: z.string().optional(),
  title: z.string().min(1),
  dosageText: z.string().min(1),
  instructions: z.string().min(1),
  exactTimes: z.string().min(1),
  daysOfWeek: z.string().min(1),
  confirmationRequired: z.boolean(),
  notifyOnMissed: z.boolean(),
})

export const wellbeingStateSchema = z.enum(['good', 'need_help', 'bad'])

export const wellbeingCheckinSchema = z.object({
  id: z.string(),
  seniorUserId: z.string(),
  state: wellbeingStateSchema,
  note: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const wellbeingCheckinListSchema = z.array(wellbeingCheckinSchema)

export const recordWellbeingCheckinRequestSchema = z.object({
  seniorUserId: z.string().optional(),
  state: wellbeingStateSchema,
  note: z.string().max(500).optional(),
})

export const timelineItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(['calm', 'watch', 'urgent']),
  timeLabel: z.string(),
  /** ISO-8601 instant для сортировки на клиенте */
  occurredAt: z.string().optional(),
})

export const timelineItemListSchema = z.array(timelineItemSchema)

export const recordMedicationIntakeRequestSchema = z.object({
  seniorUserId: z.string().optional(),
  medicationId: z.string(),
  slotIndex: z.number().int().min(0),
  status: z.enum(['taken', 'missed', 'snoozed']),
})

export type AuthActionResultDto = z.infer<typeof authActionResultSchema>
export type AuthUserDto = z.infer<typeof authUserSchema>
export type LoginRequestDto = z.infer<typeof loginRequestSchema>
export type LoginResponseDto = z.infer<typeof loginResponseSchema>
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>
export type RegisterResponseDto = z.infer<typeof registerResponseSchema>
export type CareInviteDto = z.infer<typeof careInviteSchema>
export type CreateInviteRequestDto = z.infer<typeof createInviteRequestSchema>
export type CreateInviteResponseDto = z.infer<typeof createInviteResponseSchema>
export type LookupInviteResponseDto = z.infer<typeof lookupInviteResponseSchema>
export type AcceptInviteRequestDto = z.infer<typeof acceptInviteRequestSchema>
export type AcceptInviteResponseDto = z.infer<typeof acceptInviteResponseSchema>
export type CareRelationshipDto = z.infer<typeof careRelationshipSchema>
export type CareUserSummaryDto = z.infer<typeof careUserSummarySchema>
export type MedicationDoseDto = z.infer<typeof medicationDoseSchema>
export type MedicationResponseDto = z.infer<typeof medicationResponseSchema>
export type CreateMedicationRequestDto = z.infer<typeof createMedicationRequestSchema>
export type WellbeingCheckinDto = z.infer<typeof wellbeingCheckinSchema>
export type RecordWellbeingCheckinRequestDto = z.infer<typeof recordWellbeingCheckinRequestSchema>
export type TimelineItemDto = z.infer<typeof timelineItemSchema>
export type RecordMedicationIntakeRequestDto = z.infer<typeof recordMedicationIntakeRequestSchema>
