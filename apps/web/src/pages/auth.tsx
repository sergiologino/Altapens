import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import type { UserRole } from '@altapens/shared-types'
import { roleHomePath, useAuthStore } from '@/app/store/auth-store'
import {
  useAcceptInviteMutation,
  useInviteLookupQuery,
  useLoginMutation,
  useRegisterMutation,
} from '@/shared/api/auth-client'
import { formatAuthRequestError } from '@/shared/lib/auth-request-errors'
import {
  formatRuPhoneDisplay,
  normalizeRuPhoneDigitsFromInput,
  payloadToAfterSeven,
  ruPhoneToPayload,
} from '@/shared/lib/ru-phone-mask'
import { ActionButton, ActionLink, Pill, SectionCard, SectionHeader } from '@/shared/ui/primitives'

const loginSchema = z.object({
  role: z.enum(['senior', 'caregiver']),
  email: z.string().trim().email('Введите корректный email'),
  password: z.string().min(4, 'Минимум 4 символа'),
})

const registerSchema = z.object({
  role: z.enum(['senior', 'caregiver']),
  fullName: z.string().trim().min(3, 'Укажите имя и фамилию'),
  email: z
    .string()
    .trim()
    .min(1, 'Укажите email')
    .email('Введите корректный адрес email (например name@mail.ru)'),
  phone: z
    .string()
    .regex(/^7\d{10}$/, 'Введите номер полностью в формате +7 (___) _______'),
  password: z.string().min(4, 'Минимум 4 символа'),
})

const inviteSchema = z.object({
  code: z.string().min(4, 'Введите код приглашения'),
})

const roleLabel = (role: UserRole) =>
  role === 'senior' ? 'Подопечный' : 'Родственник или опекун'

const safeNext = (next: string | null, fallback: string) =>
  next && next.startsWith('/') ? next : fallback

export const AuthLayout = () => (
  <div className="portal-page auth-page">
    <div className="auth-panel-sole">
      <Outlet />
    </div>
  </div>
)

export const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const [feedback, setFeedback] = useState('')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: (searchParams.get('role') as UserRole | null) ?? 'caregiver',
      email: '',
      password: '',
    },
  })

  return (
    <SectionCard>
      <SectionHeader eyebrow="Вход" title="Войти в приложение" />
      <form
        className="form-grid"
        onSubmit={form.handleSubmit(async (values) => {
          setFeedback('')
          try {
            const response = await loginMutation.mutateAsync(values)
            setFeedback(response.result.message)
            if (response.result.ok) {
              const next = safeNext(searchParams.get('next'), roleHomePath(values.role))
              navigate(next)
            }
          } catch (e) {
            setFeedback(formatAuthRequestError(e))
          }
        })}
      >
          <label className="field-group">
            <span className="field-label">Роль</span>
            <select className="text-input" {...form.register('role')}>
              <option value="caregiver">Родственник или опекун</option>
              <option value="senior">Подопечный</option>
            </select>
          </label>
          <label className="field-group">
            <span className="field-label">Электронная почта</span>
            <input
              className="text-input"
              autoComplete="username"
              {...form.register('email')}
              placeholder="name@example.com"
            />
            {form.formState.errors.email ? (
              <span className="field-error">{form.formState.errors.email.message}</span>
            ) : null}
          </label>
          <label className="field-group field-span-2">
            <span className="field-label">Пароль</span>
            <input
              className="text-input"
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <span className="field-error">{form.formState.errors.password.message}</span>
            ) : null}
          </label>
          <div className="button-row field-span-2 auth-form-actions wrap-row">
            <ActionButton type="submit" className="auth-submit-primary">
              {loginMutation.isPending ? 'Входим...' : 'Войти'}
            </ActionButton>
          </div>
          {feedback ? <div className="form-feedback field-span-2">{feedback}</div> : null}
      </form>
      <p className="auth-helper">
        Нет профиля? <Link to="/auth/register">Зарегистрироваться</Link>
      </p>
    </SectionCard>
  )
}

export const RegisterPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const inviteCodeFromUrl = searchParams.get('code')?.trim() || undefined
  const targetRole = (searchParams.get('role') as UserRole | null) ?? 'senior'
  const [feedback, setFeedback] = useState('')

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      role: targetRole,
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  const selectedRole = form.watch('role')

  return (
    <SectionCard>
      <SectionHeader eyebrow="Регистрация" title="Создать профиль" />
      <form
        className="form-grid"
        onSubmit={form.handleSubmit(async (values) => {
          setFeedback('')
          try {
            const response = await registerMutation.mutateAsync({
              ...values,
              inviteCode: inviteCodeFromUrl,
            })
            setFeedback(response.result.message)
            if (response.result.ok) {
              navigate(roleHomePath(values.role))
            }
          } catch (e) {
            setFeedback(formatAuthRequestError(e))
          }
        })}
      >
        <div className="field-group field-span-2">
          <span className="field-label">Роль</span>
          <div className="auth-role-toggle" role="group" aria-label="Роль">
            <button
              type="button"
              className={`auth-role-toggle-btn${selectedRole === 'caregiver' ? ' auth-role-toggle-btn-active' : ''}`}
              onClick={() => {
                form.setValue('role', 'caregiver', { shouldValidate: true, shouldDirty: true })
              }}
            >
              Опекун
            </button>
            <button
              type="button"
              className={`auth-role-toggle-btn${selectedRole === 'senior' ? ' auth-role-toggle-btn-active' : ''}`}
              onClick={() => {
                form.setValue('role', 'senior', { shouldValidate: true, shouldDirty: true })
              }}
            >
              Подопечный
            </button>
          </div>
        </div>
        <label className="field-group">
          <span className="field-label">ФИО / имя</span>
          <input className="text-input" autoComplete="name" {...form.register('fullName')} />
          {form.formState.errors.fullName ? (
            <span className="field-error">{form.formState.errors.fullName.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Электронная почта</span>
          <input className="text-input" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email ? (
            <span className="field-error">{form.formState.errors.email.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Телефон</span>
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => {
              const after = payloadToAfterSeven(field.value ?? '')
              return (
                <input
                  className="text-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="+7 (___) _______"
                  value={formatRuPhoneDisplay(after)}
                  onChange={(e) => {
                    const digits = normalizeRuPhoneDigitsFromInput(e.target.value)
                    field.onChange(ruPhoneToPayload(digits))
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )
            }}
          />
          {form.formState.errors.phone ? (
            <span className="field-error">{form.formState.errors.phone.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Пароль</span>
          <input
            className="text-input"
            type="password"
            autoComplete="new-password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <span className="field-error">{form.formState.errors.password.message}</span>
          ) : null}
        </label>
        <div className="button-row field-span-2 auth-form-actions wrap-row">
          <ActionButton type="submit" className="auth-submit-primary">
            {registerMutation.isPending ? 'Создаем профиль...' : 'Создать профиль'}
          </ActionButton>
        </div>
        {feedback ? <div className="form-feedback field-span-2">{feedback}</div> : null}
      </form>
      <p className="auth-helper">
        Уже есть доступ? <Link to="/auth/login">Войти</Link>
      </p>
    </SectionCard>
  )
}

export const InvitePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const inviteCode = searchParams.get('code') ?? ''
  const session = useAuthStore((state) => state.session)
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')
  const inviteQuery = useInviteLookupQuery(inviteCode)
  const acceptInviteMutation = useAcceptInviteMutation()

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { code: inviteCode },
  })
  const invite = inviteQuery.data?.invite ?? null

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Приглашение"
        title="Ввести код от близких"
        description="Код вам сообщил родственник или опекун. После проверки можно зарегистрироваться или войти."
      />
      <form
        className="form-grid"
        onSubmit={form.handleSubmit((values) => {
          setSearchParams({ code: values.code.trim().toUpperCase() })
          setFeedback('')
        })}
      >
        <label className="field-group field-span-2">
          <span className="field-label">Код приглашения</span>
          <input className="text-input" {...form.register('code')} placeholder="Например ALTA-CARE-2026" />
          {form.formState.errors.code ? (
            <span className="field-error">{form.formState.errors.code.message}</span>
          ) : null}
        </label>
        <div className="button-row field-span-2 wrap-row">
          <ActionButton type="submit">Проверить код</ActionButton>
        </div>
      </form>

      {invite ? (
        <div className="invite-summary">
          <div className="inline-feedback">
            <span>Создатель:</span>
            <strong>{invite.createdByName}</strong>
          </div>
          <div className="inline-feedback">
            <span>Для кого код:</span>
            <Pill tone={invite.targetRole === 'senior' ? 'watch' : 'accent'}>
              {roleLabel(invite.targetRole)}
            </Pill>
          </div>
          <div className="inline-feedback">
            <span>Статус:</span>
            <Pill tone={invite.status === 'accepted' ? 'calm' : 'accent'}>
              {invite.status === 'accepted' ? 'Уже принято' : 'Активно'}
            </Pill>
          </div>
          {invite.note ? <p className="section-description">{invite.note}</p> : null}
          {session ? (
            <div className="button-row wrap-row">
              <ActionButton
                onClick={async () => {
                  const response = await acceptInviteMutation.mutateAsync({ code: invite.code })
                  setFeedback(response.result.message)
                  if (response.result.ok) {
                    navigate(roleHomePath(session.role))
                  }
                }}
              >
                {acceptInviteMutation.isPending
                  ? 'Подключаем...'
                  : `Принять как ${roleLabel(session.role)}`}
              </ActionButton>
            </div>
          ) : (
            <div className="button-row wrap-row">
              <ActionLink to={`/auth/register?code=${invite.code}&role=${invite.targetRole}`}>
                Зарегистрироваться и принять
              </ActionLink>
              <ActionLink to={`/auth/login?role=${invite.targetRole}`} tone="secondary">
                Уже есть профиль
              </ActionLink>
            </div>
          )}
        </div>
      ) : inviteCode && !inviteQuery.isLoading ? (
        <div className="form-feedback">Код пока не найден. Проверьте раскладку и символы.</div>
      ) : null}

      {feedback ? <div className="form-feedback">{feedback}</div> : null}
    </SectionCard>
  )
}
