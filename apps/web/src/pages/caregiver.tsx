import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FirstSessionTips } from '@/features/in-app-tips/FirstSessionTips'
import { useAuthStore } from '@/app/store/auth-store'
import { AssistantPanel } from '@/features/ai-chat/AssistantPanel'
import { MedicationForm } from '@/features/medication-manage/MedicationForm'
import { useCreateInviteMutation } from '@/shared/api/auth-client'
import { useCaregiverDashboardQuery, useSeniorOverviewQuery, useTimelineQuery } from '@/shared/api/mock-api'
import {
  ActionButton,
  ActionLink,
  AppShell,
  MetricTile,
  Pill,
  SectionCard,
  SectionHeader,
  ShellNav,
} from '@/shared/ui/primitives'

const caregiverLinks = [
  { to: '/caregiver', label: 'Обзор' },
  { to: '/caregiver/seniors', label: 'Подопечные' },
  { to: '/caregiver/invites/new', label: 'Приглашения' },
  { to: '/caregiver/medications/new', label: 'Лекарства' },
  { to: '/caregiver/events', label: 'События' },
  { to: '/caregiver/assistant', label: 'Помощник' },
  { to: '/caregiver/settings', label: 'Настройки' },
]

const alertTone = (level: 'calm' | 'watch' | 'urgent') => level

export const CaregiverLayout = () => {
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)

  return (
    <AppShell
      role="caregiver"
      nav={
        <ShellNav
          title="Панель заботы"
          subtitle="Всё важное о близких: самочувствие, лекарства и события — без лишнего шума."
          links={caregiverLinks}
          footer={
            session ? (
              <div className="nav-session">
                <div>
                  <strong>{session.fullName}</strong>
                  <p>{session.email}</p>
                </div>
                <div className="nav-footer-actions">
                  <ActionLink to="/caregiver/invites/new" tone="secondary">
                    Новый код приглашения
                  </ActionLink>
                  <ActionButton tone="ghost" onClick={logout}>
                    Выйти
                  </ActionButton>
                </div>
              </div>
            ) : null
          }
        />
      }
    >
      <FirstSessionTips role="caregiver" />
      <Outlet />
    </AppShell>
  )
}

export const CaregiverDashboardPage = () => {
  const { data } = useCaregiverDashboardQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard tone="accent" className="hero-card caregiver-hero">
        <span className="eyebrow">Здравствуйте, {data.caregiver.displayName}</span>
        <h2 className="hero-card-title">Спокойный взгляд на день близких</h2>
        <p className="hero-card-text">
          Здесь только то, на что стоит обратить внимание: как себя чувствуют подопечные, как идут
          приёмы лекарств и что произошло за сегодня.
        </p>
        <div className="metric-grid">
          {data.todayMetrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>
      </SectionCard>

      <div className="panel-grid panel-grid-2">
        <SectionCard>
          <SectionHeader
            eyebrow="Подопечные"
            title="Как дела сейчас"
            description="Чуть больше деталей, чем у пожилого человека в его приложении, но без перегруза."
          />
          <div className="list-stack">
            {data.seniors.map((senior) => (
              <article key={senior.id} className="list-item">
                <div>
                  <strong>{senior.fullName}</strong>
                  <p>{senior.medicationProgress}</p>
                  <small>{senior.nextReminder}</small>
                </div>
                <Pill tone={alertTone(senior.attentionLevel)}>{senior.currentState}</Pill>
              </article>
            ))}
          </div>
          <div className="card-actions-below">
            <ActionLink to="/caregiver/seniors" tone="ghost">
              Все подопечные
            </ActionLink>
          </div>
        </SectionCard>
        <SectionCard>
          <SectionHeader
            eyebrow="Помощник"
            title="Коротко о дне"
            description="Подсказки, где лучше позвонить или навести близкого лично, а не просто «поставить галочку»."
          />
          <div className="list-stack">
            {data.aiSummaries.map((summary) => (
              <article key={summary} className="mini-card">
                <p>{summary}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export const CaregiverSeniorsPage = () => {
  const { data } = useCaregiverDashboardQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Список подопечных"
          title="Семья и близкие"
          description="Один родственник может заботиться о нескольких пожилых людях — и наоборот, если так удобнее семье."
          action={<ActionLink to="/caregiver/seniors/ivan-ivanovich">Карточка Ивана Ивановича</ActionLink>}
        />
        <div className="card-grid">
          {data.seniors.map((senior) => (
            <article key={senior.id} className="mini-card">
              <Pill tone={alertTone(senior.attentionLevel)}>{senior.currentState}</Pill>
              <h3>{senior.fullName}</h3>
              <p>{senior.age} лет</p>
              <p>{senior.medicationProgress}</p>
              <ActionLink to="/caregiver/seniors/ivan-ivanovich" tone="ghost">
                Смотреть детали
              </ActionLink>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export const CaregiverSeniorDetailPage = () => {
  const overview = useSeniorOverviewQuery()
  if (!overview.data) return null

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Подопечный"
          title={overview.data.senior.fullName}
          description="Самочувствие, лекарства и ближайшие шаги — всё в одном месте."
          action={<ActionLink to="/caregiver/medications/new">Добавить лекарство</ActionLink>}
        />
        <div className="panel-grid panel-grid-2">
          <article className="mini-card">
            <h3>Последняя отметка о самочувствии</h3>
            <p>{overview.data.latestCheckin.dateLabel}</p>
            <p>{overview.data.latestCheckin.note}</p>
          </article>
          <article className="mini-card">
            <h3>Сегодняшний ритм</h3>
            <p>{overview.data.todaySummary}</p>
          </article>
        </div>
        <div className="list-stack">
          {overview.data.medications.map((dose) => (
            <article key={dose.id} className="list-item">
              <div>
                <strong>{dose.title}</strong>
                <p>
                  {dose.plannedTime} · {dose.dosageText}
                </p>
              </div>
              <Pill tone={dose.status === 'taken' ? 'calm' : 'watch'}>
                {dose.status === 'taken' ? 'Подтверждено' : 'Ожидается'}
              </Pill>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export const CaregiverMedicationFormPage = () => (
  <div className="page-stack">
    <MedicationForm />
  </div>
)

export const CaregiverEventsPage = () => {
  const { data } = useTimelineQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="События"
          title="Что произошло"
          description="Напоминания, пропуски лекарств, сообщения от помощника и подозрительные звонки — в одной ленте."
        />
        <div className="list-stack">
          {data.map((item) => (
            <article key={item.id} className="list-item">
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <Pill tone={alertTone(item.level)}>{item.timeLabel}</Pill>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export const CaregiverAssistantPage = () => {
  const overview = useSeniorOverviewQuery()
  if (!overview.data) return null

  return (
    <div className="page-stack">
      <AssistantPanel initialMessages={overview.data.assistantMessages} compact />
    </div>
  )
}

export const CaregiverSettingsPage = () => (
  <div className="page-stack">
    <SectionCard>
      <SectionHeader
        eyebrow="Настройки"
        title="Доступ и уведомления"
        description="Здесь можно будет настроить, кому что видно и как приходят напоминания — спокойно и по-человечески."
      />
      <div className="card-grid">
        <article className="mini-card">
          <h3>Приглашения в семью</h3>
          <p>Подключение близких по коду или, при необходимости, по QR — без сложных шагов.</p>
        </article>
        <article className="mini-card">
          <h3>Уведомления</h3>
          <p>Сообщения о пропусках лекарств, тревожных сигналах и краткие сводки от помощника.</p>
        </article>
        <article className="mini-card">
          <h3>Согласие на данные</h3>
          <p>Личные сведения и здоровье используются только если близкий человек на это согласен.</p>
        </article>
      </div>
    </SectionCard>
  </div>
)

export const CaregiverInviteCreatePage = () => {
  const session = useAuthStore((state) => state.session)
  const allInvites = useAuthStore((state) => state.invites)
  const relationships = useAuthStore((state) => state.relationships)
  const createInviteMutation = useCreateInviteMutation()
  const [latestCode, setLatestCode] = useState('')
  const invites = allInvites.filter((invite) => invite.createdByUserId === session?.id)

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Приглашение"
          title="Код для подопечного"
          description="Создайте код, передайте его пожилому человеку — он сможет присоединиться к вашей семейной заботе."
        />
        <div className="button-row wrap-row">
          <ActionButton
            onClick={async () => {
              const response = await createInviteMutation.mutateAsync({
                targetRole: 'senior',
                note: 'Приглашение для подключения к семейной сети заботы.',
              })
              setLatestCode(response.invite.code)
            }}
          >
            {createInviteMutation.isPending ? 'Создаём код...' : 'Создать код для подопечного'}
          </ActionButton>
          {latestCode ? (
            <ActionLink to={`/auth/invite?code=${latestCode}`} tone="secondary">
              Открыть ссылку принятия
            </ActionLink>
          ) : null}
        </div>
        {latestCode ? (
          <div className="form-feedback">
            Новый код: <strong>{latestCode}</strong>
          </div>
        ) : null}
      </SectionCard>

      <div className="panel-grid panel-grid-2">
        <SectionCard>
          <SectionHeader
            eyebrow="Коды"
            title="Недавние приглашения"
            description="Список созданных вами кодов. При работе через сервер данные будут подтягиваться автоматически."
          />
          <div className="list-stack">
            {invites.map((invite) => (
              <article key={invite.id} className="list-item">
                <div>
                  <strong>{invite.code}</strong>
                  <p>{invite.note || 'Без дополнительной заметки'}</p>
                </div>
                <Pill tone={invite.status === 'accepted' ? 'calm' : 'accent'}>
                  {invite.status === 'accepted' ? 'Принят' : 'Активен'}
                </Pill>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <SectionHeader
            eyebrow="Связи"
            title="Кто с кем связан"
            description="После принятия приглашения подопечный и родственник видят друг друга в приложении."
          />
          <div className="list-stack">
            {relationships.map((relationship) => (
              <article key={relationship.id} className="list-item">
                <div>
                  <strong>Связь</strong>
                  <p>Подопечный: {relationship.seniorUserId}</p>
                </div>
                <Pill tone="calm">
                  {relationship.status === 'active' ? 'Активна' : relationship.status}
                </Pill>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
