import {
  acceptInviteRequestSchema,
  acceptInviteResponseSchema,
  createInviteRequestSchema,
  createInviteResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  lookupInviteResponseSchema,
  registerRequestSchema,
  registerResponseSchema,
  type AcceptInviteRequestDto,
  type AcceptInviteResponseDto,
  type CreateInviteRequestDto,
  type CreateInviteResponseDto,
  type LoginRequestDto,
  type LoginResponseDto,
  type LookupInviteResponseDto,
  type RegisterRequestDto,
  type RegisterResponseDto,
} from '@altapens/api-contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/auth-store'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Тот же origin (например nginx проксирует /api → backend) — база пустая, пути `/api/v1/...`. */
const sameOriginApi = import.meta.env.VITE_API_SAME_ORIGIN === 'true'
const rawBase = import.meta.env.VITE_API_BASE_URL
const apiBaseUrl = sameOriginApi
  ? ''
  : (typeof rawBase === 'string' ? rawBase : '').replace(/\/$/, '')
const useHttpAuthApi = sameOriginApi || Boolean(apiBaseUrl)

export const authQueryKeys = {
  invite: (code: string) => ['auth', 'invite', code.toUpperCase()] as const,
}

interface AuthApi {
  login: (payload: LoginRequestDto) => Promise<LoginResponseDto>
  register: (payload: RegisterRequestDto) => Promise<RegisterResponseDto>
  createInvite: (payload: CreateInviteRequestDto) => Promise<CreateInviteResponseDto>
  getInviteByCode: (code: string) => Promise<LookupInviteResponseDto>
  acceptInvite: (payload: AcceptInviteRequestDto) => Promise<AcceptInviteResponseDto>
}

const localAuthApi: AuthApi = {
  async login(payload) {
    const parsed = loginRequestSchema.parse(payload)
    await sleep(140)
    const result = useAuthStore.getState().login(parsed)
    const session = result.ok ? useAuthStore.getState().session : null
    return loginResponseSchema.parse({
      result,
      session,
      accessToken: result.ok ? 'local-demo-token' : undefined,
    })
  },
  async register(payload) {
    const parsed = registerRequestSchema.parse(payload)
    await sleep(180)
    const result = useAuthStore.getState().register(parsed)
    const session = result.ok ? useAuthStore.getState().session : null
    return registerResponseSchema.parse({
      result,
      session,
      accessToken: result.ok ? 'local-demo-token' : undefined,
    })
  },
  async createInvite(payload) {
    const parsed = createInviteRequestSchema.parse(payload)
    await sleep(120)
    const invite = useAuthStore.getState().createInvite(parsed)
    return createInviteResponseSchema.parse({ invite })
  },
  async getInviteByCode(code) {
    await sleep(100)
    const invite = useAuthStore.getState().getInviteByCode(code)
    return lookupInviteResponseSchema.parse({ invite: invite ?? null })
  },
  async acceptInvite(payload) {
    const parsed = acceptInviteRequestSchema.parse(payload)
    await sleep(120)
    const result = useAuthStore.getState().acceptInvite(parsed.code)
    return acceptInviteResponseSchema.parse({ result })
  },
}

const parseJson = async <T>(response: Response, schema: { parse: (value: unknown) => T }) => {
  const payload = await response.json()
  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'Request failed'
    throw new Error(message)
  }

  return schema.parse(payload)
}

const withAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const httpAuthApi: AuthApi = {
  async login(payload) {
    const parsed = loginRequestSchema.parse(payload)
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed),
    })
    return parseJson(response, loginResponseSchema)
  },
  async register(payload) {
    const parsed = registerRequestSchema.parse(payload)
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed),
    })
    return parseJson(response, registerResponseSchema)
  },
  async createInvite(payload) {
    const parsed = createInviteRequestSchema.parse(payload)
    const response = await fetch(`${apiBaseUrl}/api/v1/care/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...withAuthHeaders(),
      },
      body: JSON.stringify(parsed),
    })
    return parseJson(response, createInviteResponseSchema)
  },
  async getInviteByCode(code) {
    const response = await fetch(`${apiBaseUrl}/api/v1/care/invites/${encodeURIComponent(code)}`)
    return parseJson(response, lookupInviteResponseSchema)
  },
  async acceptInvite(payload) {
    const parsed = acceptInviteRequestSchema.parse(payload)
    const response = await fetch(
      `${apiBaseUrl}/api/v1/care/invites/${encodeURIComponent(parsed.code)}/accept`,
      {
        method: 'POST',
        headers: {
          ...withAuthHeaders(),
        },
      },
    )
    return parseJson(response, acceptInviteResponseSchema)
  },
}

export const authApi = useHttpAuthApi ? httpAuthApi : localAuthApi

const syncAuthSession = (session: LoginResponseDto['session'] | RegisterResponseDto['session'], accessToken?: string) => {
  if (!session) {
    return
  }
  useAuthStore.getState().setAuthSession(session, accessToken ?? null)
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      syncAuthSession(response.session, response.accessToken)
    },
  })

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      syncAuthSession(response.session, response.accessToken)
    },
  })

export const useCreateInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.createInvite,
    onSuccess: ({ invite }) => {
      useAuthStore.getState().syncInvite(invite)
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.invite(invite.code),
      })
    },
  })
}

export const useInviteLookupQuery = (code: string) =>
  useQuery({
    queryKey: authQueryKeys.invite(code),
    queryFn: () => authApi.getInviteByCode(code),
    enabled: Boolean(code),
    staleTime: 30_000,
  })

export const useAcceptInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.acceptInvite,
    onSuccess: (_, variables) => {
      useAuthStore.getState().syncAcceptedInvite(variables.code)
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.invite(variables.code),
      })
    },
  })
}
