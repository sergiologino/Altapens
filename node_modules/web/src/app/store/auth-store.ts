import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, CareInvite, CareRelationship, UserRole } from '@altapens/shared-types'

interface StoredUser extends AuthUser {
  password: string
}

interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  password: string
  role: UserRole
  inviteCode?: string
}

interface CreateInvitePayload {
  targetRole: UserRole
  note?: string
}

interface AuthActionResult {
  ok: boolean
  message: string
}

interface AuthState {
  session: AuthUser | null
  accessToken: string | null
  users: StoredUser[]
  invites: CareInvite[]
  relationships: CareRelationship[]
  login: (payload: LoginPayload) => AuthActionResult
  register: (payload: RegisterPayload) => AuthActionResult
  logout: () => void
  setAuthSession: (session: AuthUser | null, accessToken?: string | null) => void
  syncInvite: (invite: CareInvite) => void
  syncAcceptedInvite: (code: string) => void
  createInvite: (payload: CreateInvitePayload) => CareInvite
  acceptInvite: (code: string) => AuthActionResult
  getInviteByCode: (code: string) => CareInvite | undefined
}

const anna: StoredUser = {
  id: 'caregiver-anna',
  role: 'caregiver',
  fullName: 'Анна Смирнова',
  email: 'anna@altacare.demo',
  phone: '+7 900 100-00-01',
  password: 'demo1234',
}

const ivan: StoredUser = {
  id: 'senior-ivan',
  role: 'senior',
  fullName: 'Иван Иванович',
  email: 'ivan@altacare.demo',
  phone: '+7 900 100-00-02',
  password: 'demo1234',
}

const demoUsers: StoredUser[] = [
  anna,
  ivan,
]

const demoInvites: CareInvite[] = [
  {
    id: 'invite-active-1',
    code: 'ALTA-CARE-2026',
    createdByUserId: anna.id,
    createdByName: anna.fullName,
    targetRole: 'senior',
    status: 'active',
    expiresAt: '2026-04-19T12:00:00.000Z',
    note: 'Код для подключения нового подопечного к семье Анны.',
  },
]

const demoRelationships: CareRelationship[] = [
  {
    id: 'relationship-1',
    caregiverUserId: anna.id,
    seniorUserId: ivan.id,
    status: 'active',
  },
]

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const pickAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  role: user.role,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
})

const buildInviteCode = () => `ALTA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const isInviteExpired = (expiresAt: string) => new Date(expiresAt).getTime() < Date.now()

export const roleHomePath = (role: UserRole) => (role === 'senior' ? '/senior' : '/caregiver')

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      accessToken: null,
      users: demoUsers,
      invites: demoInvites,
      relationships: demoRelationships,
      login: ({ email, password, role }) => {
        const user = get().users.find(
          (candidate) =>
            candidate.role === role &&
            candidate.password === password &&
            normalizeEmail(candidate.email) === normalizeEmail(email),
        )

        if (!user) {
          return {
            ok: false,
            message: 'Не удалось войти. Проверьте роль, email и пароль.',
          }
        }

        set({ session: pickAuthUser(user) })
        return { ok: true, message: 'Вход выполнен.' }
      },
      register: ({ fullName, email, phone, password, role, inviteCode }) => {
        const normalizedEmail = normalizeEmail(email)
        if (get().users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
          return { ok: false, message: 'Пользователь с таким email уже существует.' }
        }

        const createdUser: StoredUser = {
          id: crypto.randomUUID(),
          role,
          fullName: fullName.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          password,
        }

        set((state) => ({
          users: [...state.users, createdUser],
          session: pickAuthUser(createdUser),
        }))

        if (inviteCode?.trim()) {
          const acceptanceResult = get().acceptInvite(inviteCode.trim())
          if (!acceptanceResult.ok) {
            return acceptanceResult
          }
          return {
            ok: true,
            message: 'Профиль создан и приглашение принято.',
          }
        }

        return { ok: true, message: 'Профиль создан.' }
      },
      logout: () => set({ session: null, accessToken: null }),
      setAuthSession: (session, accessToken = null) => set({ session, accessToken }),
      syncInvite: (invite) =>
        set((state) => ({
          invites: [
            invite,
            ...state.invites.filter((currentInvite) => currentInvite.code !== invite.code),
          ],
        })),
      syncAcceptedInvite: (code) => {
        const session = get().session
        const invite = get().getInviteByCode(code)
        if (!session || !invite) {
          return
        }

        const relationship: CareRelationship =
          invite.targetRole === 'senior'
            ? {
                id: crypto.randomUUID(),
                caregiverUserId: invite.createdByUserId,
                seniorUserId: session.id,
                status: 'active',
              }
            : {
                id: crypto.randomUUID(),
                caregiverUserId: session.id,
                seniorUserId: invite.createdByUserId,
                status: 'active',
              }

        const alreadyLinked = get().relationships.some(
          (item) =>
            item.caregiverUserId === relationship.caregiverUserId &&
            item.seniorUserId === relationship.seniorUserId,
        )

        set((state) => ({
          invites: state.invites.map((item) =>
            item.code.toUpperCase() === code.trim().toUpperCase()
              ? {
                  ...item,
                  status: 'accepted',
                  acceptedByUserId: session.id,
                }
              : item,
          ),
          relationships: alreadyLinked ? state.relationships : [relationship, ...state.relationships],
        }))
      },
      createInvite: ({ targetRole, note }) => {
        const session = get().session
        if (!session || session.role !== 'caregiver') {
          throw new Error('Приглашения может создавать только родственник или опекун.')
        }

        const invite: CareInvite = {
          id: crypto.randomUUID(),
          code: buildInviteCode(),
          createdByUserId: session.id,
          createdByName: session.fullName,
          targetRole,
          status: 'active',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          note: note?.trim(),
        }

        set((state) => ({
          invites: [invite, ...state.invites],
        }))

        return invite
      },
      acceptInvite: (code) => {
        const session = get().session
        if (!session) {
          return { ok: false, message: 'Сначала войдите или зарегистрируйтесь.' }
        }

        const invite = get().invites.find(
          (candidate) => candidate.code.toUpperCase() === code.trim().toUpperCase(),
        )

        if (!invite) {
          return { ok: false, message: 'Приглашение не найдено.' }
        }

        if (invite.status === 'accepted') {
          return { ok: false, message: 'Это приглашение уже использовано.' }
        }

        if (isInviteExpired(invite.expiresAt)) {
          return { ok: false, message: 'Срок действия приглашения истёк.' }
        }

        if (invite.targetRole !== session.role) {
          return {
            ok: false,
            message: `Это приглашение для ${invite.targetRole === 'senior' ? 'подопечного' : 'родственника или опекуна'}.`,
          }
        }

        const inviter = get().users.find((user) => user.id === invite.createdByUserId)
        if (!inviter) {
          return { ok: false, message: 'Не удалось найти создателя приглашения.' }
        }

        const relationship: CareRelationship =
          invite.targetRole === 'senior'
            ? {
                id: crypto.randomUUID(),
                caregiverUserId: inviter.id,
                seniorUserId: session.id,
                status: 'active',
              }
            : {
                id: crypto.randomUUID(),
                caregiverUserId: session.id,
                seniorUserId: inviter.id,
                status: 'active',
              }

        const alreadyLinked = get().relationships.some(
          (item) =>
            item.caregiverUserId === relationship.caregiverUserId &&
            item.seniorUserId === relationship.seniorUserId,
        )

        set((state) => ({
          invites: state.invites.map((item) =>
            item.id === invite.id
              ? {
                  ...item,
                  status: 'accepted',
                  acceptedByUserId: session.id,
                }
              : item,
          ),
          relationships: alreadyLinked ? state.relationships : [relationship, ...state.relationships],
        }))

        return { ok: true, message: 'Связка заботы создана.' }
      },
      getInviteByCode: (code) =>
        get().invites.find((candidate) => candidate.code.toUpperCase() === code.trim().toUpperCase()),
    }),
    {
      name: 'altapens-auth-store',
      partialize: (state) => ({
        session: state.session,
        accessToken: state.accessToken,
        users: state.users,
        invites: state.invites,
        relationships: state.relationships,
      }),
    },
  ),
)
