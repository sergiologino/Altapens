import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { FirstSessionTips } from '@/features/in-app-tips/FirstSessionTips'
import { useAuthStore } from '@/app/store/auth-store'
import { AssistantPanel } from '@/features/ai-chat/AssistantPanel'
import { MedicationForm } from '@/features/medication-manage/MedicationForm'
import { useCreateInviteMutation } from '@/shared/api/auth-client'
import { useBackendApi } from '@/shared/api/api-base'
import { careApi } from '@/shared/api/care-client'
import {
  mapWellbeingCheckinToEntry,
  useCareInvitesRemoteQuery,
  useCaregiverDashboardQuery,
  useTimelineQuery,
} from '@/shared/api/mock-api'
import { seniorOverviewMock } from '@/shared/api/mock-care-data'
import { CaregiverBottomNav } from '@/shared/ui/CaregiverBottomNav'
import { ActionButton, ActionLink, Pill, SectionCard, SectionHeader } from '@/shared/ui/primitives'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

const shortDisplayName = (fullName: string) => {
  const part = fullName.trim().split(/\s+/)[0]
  return part || fullName
}

const alertTone = (level: 'calm' | 'watch' | 'urgent') => level

export const CaregiverLayout = () => (
  <div className="caregiver-app-shell shell-caregiver">
    <div className="decor-orb decor-orb-primary" aria-hidden="true" />
    <div className="decor-orb decor-orb-secondary" aria-hidden="true" />
    <div className="caregiver-app-scroll">
      <FirstSessionTips role="caregiver" />
      <Outlet />
    </div>
    <CaregiverBottomNav />
  </div>
)

export const CaregiverDashboardPage = () => {
  const { data } = useCaregiverDashboardQuery()

  if (!data) return null

  const seniors = data.seniors
  const overviewMetrics = data.todayMetrics.filter((m) => m.label !== 'Подопечных')
  const watchItems = data.attentionItems.filter((a) => a.level !== 'calm')

  return (
    <div className="page-stack">
      <h1 className="caregiver-page-title">Обзор</h1>
      <p className="caregiver-overview-line" style={{ marginTop: '-0.25rem', fontSize: '0.8125rem' }}>
        {data.caregiver.displayName}, кратко на сегодня. Список людей — в разделе «Подопечные».
      </p>

      {seniors.length === 0 ? (
        <SectionCard className="caregiver-compact-card">
          <SectionHeader
            eyebrow="Сеть заботы"
            title="Пока нет подопечных"
            description="Добавьте близкого через приглашение в разделе «Подопечные»."
          />
          <ActionLink to="/caregiver/seniors" tone="secondary">
            Перейти к подопечным
          </ActionLink>
        </SectionCard>
      ) : null}

      {overviewMetrics.length > 0 ? (
        <div className="caregiver-overview-metrics">
          {overviewMetrics.map((m) => (
            <div
              key={m.label}
              className={`caregiver-metric-chip caregiver-metric-chip--${m.tone}`}
            >
              <span className="caregiver-metric-chip-label">{m.label}</span>
              <span className="caregiver-metric-chip-value">{m.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {watchItems.length > 0 ? (
        <SectionCard className="caregiver-compact-card">
          <SectionHeader eyebrow="Внимание" title="Сигналы на сегодня" />
          <ul className="caregiver-attn-compact-list">
            {watchItems.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong> — {a.description}{' '}
                <span className="caregiver-attn-meta">({a.timeLabel})</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {data.aiSummaries.length > 0 ? (
        <SectionCard className="caregiver-compact-card">
          <SectionHeader
            eyebrow="Подсказки"
            title="На сегодня"
            description="Без повтора списка подопечных — он в отдельном разделе."
          />
          <ul className="caregiver-hint-list">
            {data.aiSummaries.map((summary, idx) => (
              <li key={`${idx}-${summary.slice(0, 48)}`}>{summary}</li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  )
}

export const CaregiverSeniorsPage = () => {
  const { data } = useCaregiverDashboardQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <div className="caregiver-invite-banner">
        <div>
          <strong>Пригласить подопечного</strong>
          <p className="caregiver-banner-text">Создайте код — близкий сможет войти в вашу сеть заботы.</p>
        </div>
        <ActionLink to="/caregiver/invites/new" tone="secondary">
          Создать код
        </ActionLink>
      </div>
      <SectionCard className="caregiver-compact-card">
        <SectionHeader
          eyebrow="Список подопечных"
          title="Семья и близкие"
          description="Карточки, лекарства и приглашения — отсюда."
          action={
            data.seniors[0] ? (
              <ActionLink to={`/caregiver/seniors/${data.seniors[0].id}`}>
                Открыть: {shortDisplayName(data.seniors[0].fullName)}
              </ActionLink>
            ) : null
          }
        />
        <div className="card-grid caregiver-seniors-grid">
          {data.seniors.map((senior) => (
            <article key={senior.id} className="mini-card">
              <Pill tone={alertTone(senior.attentionLevel)}>{senior.currentState}</Pill>
              <h3>{senior.fullName}</h3>
              {senior.age > 0 ? <p>{senior.age} лет</p> : null}
              <p>{senior.medicationProgress}</p>
              <div className="button-row wrap-row">
                <ActionLink to={`/caregiver/seniors/${senior.id}`} tone="ghost">
                  Смотреть детали
                </ActionLink>
                <ActionLink to={`/caregiver/medications/new?seniorUserId=${senior.id}`} tone="secondary">
                  Лекарство
                </ActionLink>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export const CaregiverSeniorDetailPage = () => {
  const { seniorId } = useParams<{ seniorId: string }>()
  const { data: dash } = useCaregiverDashboardQuery()
  const useHttp = useBackendApi
  const senior = dash?.seniors.find((s) => s.id === seniorId)
  const demoMedications = seniorOverviewMock.medications
  const demoCheckin = seniorOverviewMock.latestCheckin
  const { data: httpDoses } = useQuery({
    queryKey: ['care', 'today-doses', seniorId],
    queryFn: () => careApi.listTodayDoses(seniorId),
    enabled: useHttp && Boolean(seniorId),
  })

  const { data: latestCheckinEntry } = useQuery({
    queryKey: ['care', 'checkins', seniorId, 'latest'],
    queryFn: async () => {
      const list = await careApi.listCheckins(seniorId, 1)
      const row = list[0]
      return row ? mapWellbeingCheckinToEntry(row) : null
    },
    enabled: useHttp && Boolean(seniorId),
  })

  if (!dash || !seniorId) return null
  if (!senior) {
    return (
      <div className="page-stack">
        <SectionCard>
          <SectionHeader
            eyebrow="Подопечный"
            title="Не найдено"
            description="Выберите подопечного в списке «Подопечные»."
          />
          <ActionLink to="/caregiver/seniors">К списку подопечных</ActionLink>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Подопечный"
          title={senior.fullName}
          description="Самочувствие, лекарства и действия."
          action={
            <ActionLink to={`/caregiver/medications/new?seniorUserId=${senior.id}`}>
              Добавить лекарство
            </ActionLink>
          }
        />
        <div className="panel-grid panel-grid-2">
          <article className="mini-card">
            <h3>Последняя отметка о самочувствии</h3>
            {useHttp ? (
              latestCheckinEntry ? (
                <>
                  <p>{latestCheckinEntry.dateLabel}</p>
                  <p>{latestCheckinEntry.note ?? '—'}</p>
                </>
              ) : (
                <p>Пока нет отметок о самочувствии за сегодня.</p>
              )
            ) : (
              <>
                <p>{demoCheckin.dateLabel}</p>
                <p>{demoCheckin.note}</p>
              </>
            )}
          </article>
          <article className="mini-card">
            <h3>Сегодняшний ритм</h3>
            <p>
              {useHttp
                ? 'Краткая сводка по дню подключим вместе с историей приёмов лекарств.'
                : seniorOverviewMock.todaySummary}
            </p>
          </article>
        </div>
        <div className="list-stack">
          {useHttp ? (
            httpDoses && httpDoses.length > 0 ? (
              httpDoses.map((dose) => (
                <article key={dose.id} className="list-item">
                  <div>
                    <strong>{dose.title}</strong>
                    <p>
                      {dose.plannedTime} · {dose.dosageText}
                    </p>
                    {dose.instructions?.trim() ? (
                      <p className="medication-curator-note">
                        <span className="field-label">Памятка: </span>
                        {dose.instructions.trim()}
                      </p>
                    ) : null}
                  </div>
                  <Pill tone={dose.status === 'taken' ? 'calm' : 'watch'}>
                    {dose.status === 'taken' ? 'Подтверждено' : 'Ожидается'}
                  </Pill>
                </article>
              ))
            ) : (
              <article className="mini-card">
                <p>Пока нет записанных приёмов на сегодня. Добавьте курс лекарств выше.</p>
              </article>
            )
          ) : (
            demoMedications.map((dose) => (
              <article key={dose.id} className="list-item">
                <div>
                  <strong>{dose.title}</strong>
                  <p>
                    {dose.plannedTime} · {dose.dosageText}
                  </p>
                  {dose.instructions?.trim() ? (
                    <p className="medication-curator-note">
                      <span className="field-label">Памятка: </span>
                      {dose.instructions.trim()}
                    </p>
                  ) : null}
                </div>
                <Pill tone={dose.status === 'taken' ? 'calm' : 'watch'}>
                  {dose.status === 'taken' ? 'Подтверждено' : 'Ожидается'}
                </Pill>
              </article>
            ))
          )}
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
          description="Хронология: лекарства, помощник, важное."
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

export const CaregiverAssistantPage = () => (
  <div className="page-stack">
    <AssistantPanel initialMessages={seniorOverviewMock.assistantMessages} compact />
  </div>
)

export const CaregiverSettingsPage = () => {
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="page-stack">
      <SectionCard>
        {session ? (
          <div className="settings-session-block">
            <strong>{session.fullName}</strong>
            <p>{session.email}</p>
            <div className="button-row wrap-row">
              <ActionLink to="/caregiver/seniors" tone="secondary">
                Подопечные и коды
              </ActionLink>
              <ActionButton tone="ghost" onClick={logout}>
                Выйти
              </ActionButton>
            </div>
          </div>
        ) : null}
        <SectionHeader
          eyebrow="Настройки"
          title="Экран и разделы"
          description="Тема оформления и переходы к разделам приложения."
        />
      <div className="settings-theme-block">
        <h3 className="settings-subheading">Тема</h3>
        <ThemeToggle />
      </div>
      <h3 className="settings-subheading">Разделы</h3>
      <ul className="settings-nav-list">
        <li>
          <div className="settings-nav-row">
            <div className="settings-nav-row-main">
              <h3>Подопечные и приглашения</h3>
              <p>Список людей, карточки и создание кода приглашения — в одном разделе.</p>
            </div>
            <ActionLink to="/caregiver/seniors" tone="secondary">
              Открыть
            </ActionLink>
          </div>
        </li>
        <li>
          <div className="settings-nav-row settings-nav-row--stack">
            <div className="settings-nav-row-main">
              <h3>Уведомления</h3>
              <p>Push и письма о событиях — позже, отдельными настройками.</p>
            </div>
            <span className="settings-nav-meta">Скоро</span>
          </div>
        </li>
        <li>
          <div className="settings-nav-row settings-nav-row--stack">
            <div className="settings-nav-row-main">
              <h3>Согласие на данные</h3>
              <p>
                Обработка сведений о здоровье — по согласию подопечного и в рамках политики сервиса. Отдельный
                экран согласия будет добавлен позже.
              </p>
            </div>
            <span className="settings-nav-meta">Позже</span>
          </div>
        </li>
      </ul>
    </SectionCard>
    </div>
  )
}

export const CaregiverInviteCreatePage = () => {
  const session = useAuthStore((state) => state.session)
  const allInvites = useAuthStore((state) => state.invites)
  const relationships = useAuthStore((state) => state.relationships)
  const createInviteMutation = useCreateInviteMutation()
  const [latestCode, setLatestCode] = useState('')
  const [createError, setCreateError] = useState('')
  const useHttp = useBackendApi
  const remoteInvites = useCareInvitesRemoteQuery()
  const invites = useHttp
    ? (remoteInvites.data ?? [])
    : allInvites.filter((invite) => invite.createdByUserId === session?.id)

  const copyCode = async () => {
    if (!latestCode) return
    try {
      await navigator.clipboard.writeText(latestCode)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Приглашение"
          title="Код для подопечного"
          description="Код для входа подопечного в вашу сеть заботы."
        />
        <div className="button-row wrap-row">
          <ActionButton
            onClick={async () => {
              setCreateError('')
              try {
                const response = await createInviteMutation.mutateAsync({
                  targetRole: 'senior',
                  note: 'Приглашение для подключения к семейной сети заботы.',
                })
                const code = response.invite?.code?.trim()
                if (!code) {
                  setCreateError('Сервер не вернул код приглашения. Попробуйте ещё раз или проверьте ответ API.')
                  return
                }
                setLatestCode(code)
              } catch (e) {
                setCreateError(
                  e instanceof Error ? e.message : 'Не удалось создать код. Проверьте сеть и авторизацию.',
                )
              }
            }}
          >
            {createInviteMutation.isPending ? 'Создаём код...' : 'Создать код для подопечного'}
          </ActionButton>
          {latestCode ? (
            <ActionLink to={`/auth/invite?code=${encodeURIComponent(latestCode)}`} tone="secondary">
              Открыть ссылку принятия
            </ActionLink>
          ) : null}
        </div>
        {createError ? (
          <p className="invite-code-error" role="alert">
            {createError}
          </p>
        ) : null}
        {latestCode ? (
          <div className="invite-code-panel">
            <span className="invite-code-panel-label">Передайте подопечному</span>
            <code className="invite-code-panel-value">{latestCode}</code>
            <div className="invite-code-panel-actions">
              <ActionButton type="button" tone="secondary" onClick={() => void copyCode()}>
                Скопировать код
              </ActionButton>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <div className="panel-grid panel-grid-2">
        <SectionCard>
          <SectionHeader
            eyebrow="Коды"
            title="Недавние приглашения"
            description="Созданные вами коды (с сервера — актуальный список)."
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
            description="После принятия кода подопечный появляется в вашем списке."
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
