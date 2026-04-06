import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { ActionButton, ActionLink, Pill, SectionCard, SectionHeader } from '@/shared/ui/primitives'

const loginSchema = z.object({
  role: z.enum(['senior', 'caregiver']),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(4, 'Минимум 4 символа'),
})

const registerSchema = z.object({
  role: z.enum(['senior', 'caregiver']),
  fullName: z.string().min(3, 'Укажите имя и фамилию'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(8, 'Добавьте телефон'),
  password: z.string().min(4, 'Минимум 4 символа'),
  inviteCode: z.string().optional(),
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
    <section className="hero-panel auth-hero">
      <span className="eyebrow">Вход в AltaPens</span>
      <h1 className="hero-title">Войти, выбрать роль и пригласить близких</h1>
      <p className="hero-description">
        Здесь вы входите в приложение, выбираете, кто вы — пожилой человек или родственник, и при
        необходимости принимаете приглашение по коду.
      </p>
      <div className="button-row wrap-row">
        <ActionLink to="/auth/login">Войти</ActionLink>
        <ActionLink to="/auth/register" tone="secondary">
          Создать профиль
        </ActionLink>
        <ActionLink to="/auth/invite" tone="ghost">
          Принять приглашение
        </ActionLink>
      </div>
    </section>
    <div className="auth-grid">
      <Outlet />
      <SectionCard tone="warm">
        <SectionHeader
          eyebrow="Демо-доступ"
          title="Примеры для пробы"
          description="Можно войти под готовыми именами или сразу создать свой профиль."
        />
        <div className="list-stack">
          <article className="mini-card">
            <Pill tone="accent">Родственник</Pill>
            <h3>Анна Смирнова</h3>
            <p>anna@altacare.demo</p>
            <p>Пароль: demo1234</p>
          </article>
          <article className="mini-card">
            <Pill tone="watch">Подопечный</Pill>
            <h3>Иван Иванович</h3>
            <p>ivan@altacare.demo</p>
            <p>Пароль: demo1234</p>
          </article>
          <article className="mini-card">
            <Pill tone="calm">Код приглашения</Pill>
            <h3>Можно ввести при регистрации</h3>
            <p>ALTA-CARE-2026</p>
            <p>По нему новый подопечный присоединяется к заботе Анны.</p>
          </article>
        </div>
      </SectionCard>
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
      password: 'demo1234',
    },
  })

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Вход"
        title="Войти в приложение"
        description="После входа откроется экран для вашей роли — подопечного или родственника."
      />
      <form
        className="form-grid"
        onSubmit={form.handleSubmit(async (values) => {
          const response = await loginMutation.mutateAsync(values)
          setFeedback(response.result.message)
          if (response.result.ok) {
            const next = safeNext(searchParams.get('next'), roleHomePath(values.role))
            navigate(next)
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
            <input className="text-input" {...form.register('email')} placeholder="anna@altacare.demo" />
            {form.formState.errors.email ? (
              <span className="field-error">{form.formState.errors.email.message}</span>
            ) : null}
          </label>
          <label className="field-group field-span-2">
            <span className="field-label">Пароль</span>
            <input className="text-input" type="password" {...form.register('password')} />
            {form.formState.errors.password ? (
              <span className="field-error">{form.formState.errors.password.message}</span>
            ) : null}
          </label>
          <div className="button-row field-span-2 wrap-row">
            <ActionButton type="submit">
              {loginMutation.isPending ? 'Входим...' : 'Войти'}
            </ActionButton>
            <ActionButton
              type="button"
              tone="secondary"
              onClick={() => {
                form.reset({
                  role: 'caregiver',
                  email: 'anna@altacare.demo',
                  password: 'demo1234',
                })
              }}
            >
              Подставить демо: родственник
            </ActionButton>
            <ActionButton
              type="button"
              tone="ghost"
              onClick={() => {
                form.reset({
                  role: 'senior',
                  email: 'ivan@altacare.demo',
                  password: 'demo1234',
                })
              }}
            >
              Подставить демо: подопечный
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
  const inviteCode = searchParams.get('code') ?? ''
  const targetRole = (searchParams.get('role') as UserRole | null) ?? 'senior'
  const [feedback, setFeedback] = useState('')

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: targetRole,
      fullName: '',
      email: '',
      phone: '',
      password: 'demo1234',
      inviteCode,
    },
  })

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Регистрация"
        title="Создать профиль"
        description="Если у вас есть код приглашения, введите его — так вы присоединитесь к семейной заботе."
      />
      <form
        className="form-grid"
        onSubmit={form.handleSubmit(async (values) => {
          const response = await registerMutation.mutateAsync(values)
          setFeedback(response.result.message)
          if (response.result.ok) {
            navigate(roleHomePath(values.role))
          }
        })}
      >
        <label className="field-group">
          <span className="field-label">Роль</span>
          <select className="text-input" {...form.register('role')}>
            <option value="senior">Подопечный</option>
            <option value="caregiver">Родственник или опекун</option>
          </select>
        </label>
        <label className="field-group">
          <span className="field-label">ФИО / имя</span>
          <input className="text-input" {...form.register('fullName')} />
          {form.formState.errors.fullName ? (
            <span className="field-error">{form.formState.errors.fullName.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Электронная почта</span>
          <input className="text-input" {...form.register('email')} />
          {form.formState.errors.email ? (
            <span className="field-error">{form.formState.errors.email.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Телефон</span>
          <input className="text-input" {...form.register('phone')} />
          {form.formState.errors.phone ? (
            <span className="field-error">{form.formState.errors.phone.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Пароль</span>
          <input className="text-input" type="password" {...form.register('password')} />
          {form.formState.errors.password ? (
            <span className="field-error">{form.formState.errors.password.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Код приглашения</span>
          <input className="text-input" {...form.register('inviteCode')} placeholder="Если вам его дали" />
        </label>
        <div className="button-row field-span-2 wrap-row">
          <ActionButton type="submit">
            {registerMutation.isPending ? 'Создаем профиль...' : 'Создать профиль'}
          </ActionButton>
          <ActionLink to="/auth/invite" tone="secondary">
            Сначала проверить код
          </ActionLink>
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
