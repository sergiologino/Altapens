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
