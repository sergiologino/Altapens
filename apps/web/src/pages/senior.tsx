import { Outlet } from 'react-router-dom'
import { FirstSessionTips } from '@/features/in-app-tips/FirstSessionTips'
import { CheckinActions } from '@/features/senior-checkin/CheckinActions'
import { AssistantPanel } from '@/features/ai-chat/AssistantPanel'
import { useAuthStore } from '@/app/store/auth-store'
import { useBackendApi } from '@/shared/api/api-base'
import { useRecordMedicationIntakeMutation } from '@/shared/api/care-client'
import {
  useCheckinsQuery,
  useMedicationHistoryQuery,
  useSeniorOverviewQuery,
} from '@/shared/api/mock-api'
import { useAccessibilityStore } from '@/app/store/accessibility-store'
import {
  ActionButton,
  ActionLink,
  AppShell,
  DetailRow,
  Pill,
  SectionCard,
  SectionHeader,
  ShellNav,
} from '@/shared/ui/primitives'

const seniorLinks = [
  { to: '/senior', label: 'Главная' },
  { to: '/senior/today', label: 'Сегодня' },
  { to: '/senior/assistant', label: 'Помощник' },
  { to: '/senior/history', label: 'История' },
  { to: '/senior/profile', label: 'Профиль' },
]

const doseTone = (status: string) => {
  if (status === 'taken') return 'calm'
  if (status === 'missed') return 'urgent'
  return 'watch'
}

const scaleClass: Record<'normal' | 'large' | 'x-large', string> = {
  normal: 'scale-normal',
  large: 'scale-large',
  'x-large': 'scale-x-large',
}

export const SeniorLayout = () => {
  const { fontScale, highContrast } = useAccessibilityStore()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className={highContrast ? 'high-contrast' : undefined}>
      <div className={scaleClass[fontScale]}>
        <AppShell
          role="senior"
          nav={
            <ShellNav
              title="Мой день"
              subtitle="Крупные кнопки и простые слова — чтобы было спокойно пользоваться каждый день."
              links={seniorLinks}
              footer={
                session ? (
                  <div className="nav-session">
                    <div>
                      <strong>{session.fullName}</strong>
                      <p>{session.email}</p>
                    </div>
                    <ActionButton tone="ghost" onClick={logout}>
                      Выйти
                    </ActionButton>
                  </div>
                ) : null
              }
            />
          }
        >
          <FirstSessionTips role="senior" />
          <Outlet />
        </AppShell>
      </div>
    </div>
  )
}

export const SeniorHomePage = () => {
  const { data } = useSeniorOverviewQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard tone="accent" className="hero-card senior-hero">
        <span className="eyebrow">Здравствуйте, {data.senior.fullName}</span>
        <h2 className="hero-card-title">Сегодня всё под рукой: самочувствие, лекарства и помощь.</h2>
        <p className="hero-card-text">{data.todaySummary}</p>
        <div className="button-stack button-stack-mobile">
          <ActionButton className="senior-cta">Мне хорошо</ActionButton>
          <ActionLink to="/senior/sos" tone="danger">
            SOS / нужна помощь
          </ActionLink>
          <ActionLink to="/senior/assistant" tone="secondary">
            Спросить помощника
          </ActionLink>
        </div>
      </SectionCard>

      <div className="panel-grid panel-grid-2">
        <CheckinActions />
        <SectionCard>
          <SectionHeader
            eyebrow="Сегодня"
            title="Ближайшие дела"
            description="Минимум текста, только важное на сегодня."
          />
          <div className="list-stack">
            {data.medications.map((medication) => (
              <div key={medication.id} className="list-item medication-row">
                <div>
                  <strong>{medication.title}</strong>
                  <p>{medication.dosageText}</p>
                </div>
                <div className="medication-meta">
                  <Pill tone={doseTone(medication.status)}>{medication.plannedTime}</Pill>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionHeader
          eyebrow="Связь с близкими"
          title="Близкие на связи"
          description="Они видят, что с вами всё в порядке или если нужна помощь — без давления и без слежки."
        />
        <div className="card-grid">
          {data.alerts.map((alert) => (
            <article key={alert.id} className="mini-card">
              <Pill tone={alert.level}>{alert.timeLabel}</Pill>
              <h3>{alert.title}</h3>
              <p>{alert.description}</p>
            </article>
          ))}
          <article className="mini-card">
            <Pill tone="accent">Антискам</Pill>
            <h3>Если звонок кажется опасным</h3>
            <p>Есть отдельный быстрый экран с крупными действиями и сообщением детям.</p>
            <ActionLink to="/senior/anti-scam" tone="ghost">
              Открыть защитный экран
            </ActionLink>
          </article>
        </div>
      </SectionCard>
    </div>
  )
}

export const SeniorTodayPage = () => {
  const { data } = useSeniorOverviewQuery()
  const useHttp = useBackendApi
  const intake = useRecordMedicationIntakeMutation()

  const postIntake = (doseId: string, status: 'taken' | 'missed' | 'snoozed') => {
    if (!useHttp) return
    const colon = doseId.lastIndexOf(':')
    if (colon < 0) return
    const medicationId = doseId.slice(0, colon)
    const slotIndex = Number(doseId.slice(colon + 1))
    if (!Number.isFinite(slotIndex)) return
    intake.mutate({ medicationId, slotIndex, status })
  }

  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Лекарства"
          title="Напоминания на сегодня"
          description="Когда пора принять лекарство, приложение напомнит. Подтверждение можно оставить или убрать — как вам удобнее."
        />
        <div className="medication-card-list">
          {data.medications.map((dose) => (
            <article key={dose.id} className="medication-card">
              <div className="medication-card-top">
                <div>
                  <h3>{dose.title}</h3>
                  <p>{dose.dosageText}</p>
                </div>
                <Pill tone={doseTone(dose.status)}>{dose.plannedTime}</Pill>
              </div>
              <p className="medication-note">
                {dose.confirmationRequired
                  ? 'Для этого приёма нужно одно нажатие подтверждения.'
                  : 'Подтверждение можно отключить, чтобы напоминание было мягче.'}
              </p>
              <div className="button-stack button-stack-mobile">
                <ActionButton
                  className="senior-cta"
                  disabled={useHttp && intake.isPending}
                  onClick={() => postIntake(dose.id, 'taken')}
                >
                  Принял
                </ActionButton>
                <ActionButton
                  tone="secondary"
                  className="senior-cta"
                  disabled={useHttp && intake.isPending}
                  onClick={() => postIntake(dose.id, 'snoozed')}
                >
                  Позже
                </ActionButton>
                <ActionButton
                  tone="ghost"
                  className="senior-cta"
                  disabled={useHttp && intake.isPending}
                  onClick={() => postIntake(dose.id, 'missed')}
                >
                  Пропустить
                </ActionButton>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export const SeniorAssistantPage = () => {
  const { data } = useSeniorOverviewQuery()
  if (!data) return null

  return (
    <div className="page-stack">
      <AssistantPanel initialMessages={data.assistantMessages} />
    </div>
  )
}

export const SeniorHistoryPage = () => {
  const checkins = useCheckinsQuery()
  const history = useMedicationHistoryQuery()

  return (
    <div className="page-stack">
      <div className="panel-grid panel-grid-2">
        <SectionCard>
          <SectionHeader
            eyebrow="Самочувствие"
            title="Как вы себя чувствовали"
            description="Простые отметки по дням — чтобы вы и близкие помнили, как проходило время."
          />
          <div className="list-stack">
            {checkins.data?.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <strong>{item.dateLabel}</strong>
                  <p>{item.note}</p>
                </div>
                <Pill tone={item.state === 'good' ? 'calm' : item.state === 'need_help' ? 'watch' : 'urgent'}>
                  {item.state === 'good'
                    ? 'Мне хорошо'
                    : item.state === 'need_help'
                      ? 'Нужна помощь'
                      : 'Плохо'}
                </Pill>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <SectionHeader
            eyebrow="Приёмы"
            title="История лекарств"
            description="Приняли или пропустили — всё видно простым списком, без таблиц и жаргона."
          />
          <div className="list-stack">
            {history.data?.map((dose) => (
              <div key={dose.id} className="list-item">
                <div>
                  <strong>{dose.title}</strong>
                  <p>{dose.plannedTime}</p>
                </div>
                <Pill tone={doseTone(dose.status)}>
                  {dose.status === 'taken'
                    ? 'Принял'
                    : dose.status === 'missed'
                      ? 'Пропуск'
                      : dose.status === 'snoozed'
                        ? 'Позже'
                        : 'Ожидается'}
                </Pill>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export const SeniorProfilePage = () => {
  const { fontScale, highContrast, voiceEnabled, setFontScale, setHighContrast, setVoiceEnabled } =
    useAccessibilityStore()

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Удобство"
          title="Настройки экрана"
          description="Крупный шрифт, контраст и при желании озвучка — всё простыми переключателями."
        />
        <div className="settings-grid">
          <div className="mini-card">
            <h3>Размер текста</h3>
            <div className="button-row wrap-row">
              <ActionButton
                tone={fontScale === 'normal' ? 'primary' : 'secondary'}
                onClick={() => setFontScale('normal')}
              >
                Обычный
              </ActionButton>
              <ActionButton
                tone={fontScale === 'large' ? 'primary' : 'secondary'}
                onClick={() => setFontScale('large')}
              >
                Крупный
              </ActionButton>
              <ActionButton
                tone={fontScale === 'x-large' ? 'primary' : 'secondary'}
                onClick={() => setFontScale('x-large')}
              >
                Очень крупный
              </ActionButton>
            </div>
          </div>
          <div className="mini-card">
            <h3>Голос и звук</h3>
            <p>Озвучка ответов и в будущем — голосовой ввод, если захотите говорить вместо набора текста.</p>
            <div className="button-row wrap-row">
              <ActionButton
                tone={voiceEnabled ? 'primary' : 'secondary'}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? 'Озвучка включена' : 'Включить озвучку'}
              </ActionButton>
              <ActionButton
                tone={highContrast ? 'primary' : 'secondary'}
                onClick={() => setHighContrast(!highContrast)}
              >
                {highContrast ? 'Высокий контраст' : 'Включить контраст'}
              </ActionButton>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export const SeniorSosPage = () => (
  <div className="page-stack">
    <SectionCard className="danger-panel">
      <SectionHeader
        eyebrow="Экстренная помощь"
        title="Если случилось беда"
        description="После нажатия близкие получают срочное уведомление. Геолокацию можно подключить отдельно, если вы согласны."
      />
      <div className="button-stack button-stack-mobile">
        <ActionButton tone="danger" className="senior-cta senior-sos-button">
          Отправить SOS
        </ActionButton>
        <ActionButton tone="secondary" className="senior-cta">
          Позвонить Анне
        </ActionButton>
      </div>
    </SectionCard>
  </div>
)

export const SeniorAntiScamPage = () => (
  <div className="page-stack">
    <SectionCard tone="warm">
      <SectionHeader
        eyebrow="Защита от обмана"
        title="Если звонок кажется подозрительным"
        description="Крупные кнопки — чтобы быстро оборвать разговор и предупредить близких."
      />
      <div className="button-stack button-stack-mobile">
        <ActionButton tone="danger" className="senior-cta">
          Завершить разговор
        </ActionButton>
        <ActionButton className="senior-cta">Сообщить детям</ActionButton>
        <ActionButton tone="secondary" className="senior-cta">
          Заблокировать номер
        </ActionButton>
      </div>
      <SectionCard className="nested-card">
        <DetailRow label="Что дальше" value="Можно будет сохранять номер и передавать его в службу поддержки или родным." />
        <DetailRow label="Совет" value="Не передавайте незнакомцам коды из смс и данные карты." />
      </SectionCard>
    </SectionCard>
  </div>
)
