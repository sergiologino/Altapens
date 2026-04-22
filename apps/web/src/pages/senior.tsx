import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FirstSessionTips } from '@/features/in-app-tips/FirstSessionTips'
import { useMedicationBrowserReminders } from '@/features/medication-reminders/useMedicationBrowserReminders'
import { SeniorVoiceShell } from '@/features/voice/SeniorVoiceShell'
import { AssistantPanel } from '@/features/ai-chat/AssistantPanel'
import { MedicationMemoryBlock } from '@/features/medications/MedicationMemoryBlock'
import { useAuthStore } from '@/app/store/auth-store'
import { useReminderPrefsStore } from '@/app/store/reminder-prefs-store'
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
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

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
  const { fontScale, highContrast, voiceEnabled } = useAccessibilityStore()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)
  const browserMedicationReminders = useReminderPrefsStore((s) => s.browserMedicationReminders)
  const { data: seniorOverview } = useSeniorOverviewQuery()
  useMedicationBrowserReminders(
    seniorOverview?.medications,
    Boolean(session && browserMedicationReminders),
  )

  return (
    <div className={highContrast ? 'high-contrast' : undefined}>
      <div className={scaleClass[fontScale]}>
        <AppShell
          role="senior"
          mainClassName={voiceEnabled ? 'shell-main--voice-dock' : undefined}
          nav={
            <ShellNav
              title="Мой день"
              subtitle="Разделы приложения"
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
          <SeniorVoiceShell />
          <Outlet />
        </AppShell>
      </div>
    </div>
  )
}

export const SeniorHomePage = () => {
  const { data } = useSeniorOverviewQuery()
  const { voiceEnabled } = useAccessibilityStore()
  if (!data) return null

  return (
    <div className="page-stack">
      <SectionCard tone="accent" className="hero-card senior-hero">
        <span className="eyebrow">Здравствуйте, {data.senior.fullName}</span>
        <h2 className="hero-card-title">Сегодня: самочувствие, лекарства, помощь</h2>
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

      <SectionCard>
        <SectionHeader
          eyebrow="Сегодня"
          title="Ближайшие дела"
          description="Расписание приёмов на сегодня."
        />
        <div className="list-stack">
          {data.medications.map((medication) => (
            <div key={medication.id} className="list-item medication-row medication-row--home">
              <div className="medication-row-head">
                <div>
                  <strong>{medication.title}</strong>
                  <p>{medication.dosageText}</p>
                </div>
                <Pill tone={doseTone(medication.status)}>{medication.plannedTime}</Pill>
              </div>
              <MedicationMemoryBlock
                title={medication.title}
                dosageText={medication.dosageText}
                instructions={medication.instructions}
                hideSpeakButtons={!voiceEnabled}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          eyebrow="Связь с близкими"
          title="Близкие на связи"
          description="Сообщения от приложения и близких."
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
  const { voiceEnabled } = useAccessibilityStore()
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
          description="Подтверждение приёма — по желанию, в настройках курса."
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
              <MedicationMemoryBlock
                title={dose.title}
                dosageText={dose.dosageText}
                instructions={dose.instructions}
                hideSpeakButtons={!voiceEnabled}
              />
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
            description="Отметки по дням."
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
            description="Статусы приёмов за период."
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
  const browserMedicationReminders = useReminderPrefsStore((s) => s.browserMedicationReminders)
  const setBrowserMedicationReminders = useReminderPrefsStore((s) => s.setBrowserMedicationReminders)
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  )

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    queueMicrotask(() => {
      setNotifyPermission(Notification.permission)
    })
  }, [browserMedicationReminders])

  const requestBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') return
    const next = await Notification.requestPermission()
    setNotifyPermission(next)
    if (next === 'granted') {
      setBrowserMedicationReminders(true)
    }
  }

  return (
    <div className="page-stack">
      <SectionCard>
        <SectionHeader
          eyebrow="Удобство"
          title="Настройки экрана"
          description="Тема, шрифт, контраст, озвучка и напоминания."
        />
        <div className="settings-grid">
          <div className="mini-card settings-span-full">
            <h3>Напоминания о лекарствах</h3>
            <p className="settings-hint">
              Когда приложение открыто, в назначенное время можно показать напоминание вне вкладки. Полноценные
              push без открытого приложения — позже.
            </p>
            {notifyPermission === 'unsupported' ? (
              <p className="settings-hint">В этом браузере уведомления недоступны.</p>
            ) : notifyPermission === 'denied' ? (
              <p className="settings-hint">
                Уведомления отключены в настройках браузера. Разрешите их для этого сайта — тогда напоминания
                смогут появляться.
              </p>
            ) : notifyPermission === 'default' ? (
              <>
                <div className="button-row wrap-row settings-reminder-actions">
                  <ActionButton type="button" onClick={() => void requestBrowserNotifications()}>
                    Разрешить уведомления
                  </ActionButton>
                </div>
                <p className="settings-hint">Нажмите кнопку и подтвердите в окне браузера — после этого появится переключатель напоминаний.</p>
              </>
            ) : (
              <div className="button-row wrap-row settings-reminder-actions">
                <ActionButton
                  tone={browserMedicationReminders ? 'primary' : 'secondary'}
                  onClick={() => setBrowserMedicationReminders(!browserMedicationReminders)}
                >
                  {browserMedicationReminders ? 'Напоминания включены' : 'Включить напоминания'}
                </ActionButton>
              </div>
            )}
          </div>
          <div className="mini-card">
            <h3>Тема</h3>
            <ThemeToggle />
          </div>
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
        description="Сигнал близким. Геолокация — отдельно, по согласию."
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
        description="Быстрые действия при подозрительном звонке."
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
