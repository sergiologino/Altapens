import type {
  CareUserSummaryDto,
  MedicationDoseDto,
  WellbeingCheckinDto,
} from '@altapens/api-contracts'
import type { AuthUser, CaregiverDashboard, MedicationDose, SeniorOverview } from '@altapens/shared-types'

import { seniorOverviewMock } from '@/shared/api/mock-care-data'

const displayNameFromFull = (fullName: string) => {
  const part = fullName.trim().split(/\s+/)[0]
  return part || fullName
}

const wellbeingShort = (state: WellbeingCheckinDto['state']): string => {
  switch (state) {
    case 'good':
      return 'хорошо'
    case 'need_help':
      return 'нужна помощь'
    case 'bad':
      return 'плохо'
    default:
      return state
  }
}

const isSameCalendarDay = (iso: string, now: Date): boolean => {
  const d = new Date(iso)
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/** Последняя отметка за календарный день `day` (список обычно от новых к старым). */
const latestCheckinOnDay = (
  checkins: WellbeingCheckinDto[],
  day: Date,
): WellbeingCheckinDto | undefined =>
  checkins.find((c) => isSameCalendarDay(c.createdAt, day))

const timeShort = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', { timeStyle: 'short' }).format(new Date(iso))

/** Склонение «приём» для текстов сводки (без жаргона «слот»). */
const intakeCountWord = (n: number): string => {
  const m = n % 100
  const m10 = n % 10
  if (m >= 11 && m <= 14) return 'приёмов'
  if (m10 === 1) return 'приём'
  if (m10 >= 2 && m10 <= 4) return 'приёма'
  return 'приёмов'
}

const comparePlannedTime = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })

/** Если бэкенд ещё отдаёт upcoming, а время слота уже прошло — считаем пропуском (как на сервере). */
export function effectiveDoseStatus(d: MedicationDoseDto, now: Date): MedicationDoseDto['status'] {
  if (d.status !== 'upcoming') {
    return d.status
  }
  const m = d.plannedTime.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) {
    return d.status
  }
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    return d.status
  }
  const slot = new Date(now)
  slot.setHours(hh, mm, 0, 0)
  return now.getTime() > slot.getTime() ? 'missed' : 'upcoming'
}

export function summarizeMedicationLine(doses: MedicationDoseDto[], now: Date = new Date()): {
  progress: string
  nextReminder: string
  taken: number
  missed: number
  total: number
} {
  if (doses.length === 0) {
    return {
      progress: 'Сегодня нет запланированных приёмов',
      nextReminder: '—',
      taken: 0,
      missed: 0,
      total: 0,
    }
  }

  let taken = 0
  let missed = 0
  let upcoming = 0
  let snoozed = 0
  for (const d of doses) {
    const st = effectiveDoseStatus(d, now)
    if (st === 'taken') taken += 1
    else if (st === 'missed') missed += 1
    else if (st === 'upcoming') upcoming += 1
    else if (st === 'snoozed') snoozed += 1
  }

  const total = doses.length
  const rest = upcoming + snoozed
  const progress = `Сегодня ${total} ${intakeCountWord(total)}: принято ${taken}, пропущено ${missed}, ожидается ${rest}`

  const pending = doses.filter((d) => {
    const st = effectiveDoseStatus(d, now)
    return st === 'upcoming' || st === 'snoozed'
  })
  pending.sort((x, y) => comparePlannedTime(x.plannedTime, y.plannedTime))

  let nextReminder: string
  if (pending.length > 0) {
    const p = pending[0]
    const st = effectiveDoseStatus(p, now)
    const tag = st === 'snoozed' ? 'отложено' : 'следующий'
    nextReminder = `${tag}: ${p.title} в ${p.plannedTime}`
  } else if (total > 0 && taken === total) {
    nextReminder = 'Все запланированные приёмы на сегодня отмечены'
  } else if (total > 0 && missed === total) {
    nextReminder = 'Ни один приём за сегодня не подтверждён'
  } else if (total > 0) {
    nextReminder = 'Есть приёмы без подтверждения — см. расписание'
  } else {
    nextReminder = '—'
  }

  return { progress, nextReminder, taken, missed, total }
}

export type CaregiverPerSeniorInsights = {
  doses: MedicationDoseDto[]
  checkins: WellbeingCheckinDto[]
}

/** Сводка опекуна из сессии + список подопечных с backend. При `insights` — строки из реальных доз и чек-инов. */
export function buildCaregiverDashboardFromApi(
  session: AuthUser,
  seniors: CareUserSummaryDto[],
  insights?: Record<string, CaregiverPerSeniorInsights>,
): CaregiverDashboard {
  const caregiver = {
    id: session.id,
    displayName: displayNameFromFull(session.fullName),
    relationshipType: 'Семья',
    contact: session.email,
  }

  const now = new Date()

  const seniorRows = seniors.map((s) => {
    const pack = insights?.[s.userId]
    const doses = pack?.doses ?? []
    const checkins = pack?.checkins ?? []
    const lastToday = latestCheckinOnDay(checkins, now)

    const { progress, nextReminder, missed } = summarizeMedicationLine(doses, now)

    let attentionLevel: 'calm' | 'watch' | 'urgent' = 'calm'
    if (lastToday?.state === 'bad') attentionLevel = 'urgent'
    else if (lastToday?.state === 'need_help' || missed > 0) attentionLevel = 'watch'

    let currentState: string
    if (lastToday) {
      currentState =
        lastToday.state === 'good'
          ? 'Хорошо'
          : lastToday.state === 'need_help'
            ? 'Нужна помощь'
            : 'Плохо'
    } else {
      currentState = s.status === 'active' ? 'На связи' : '—'
    }

    return {
      id: s.userId,
      fullName: s.fullName,
      age: 0,
      currentState,
      attentionLevel,
      medicationProgress: insights ? progress : 'Расписание на сегодня — в карточке подопечного',
      nextReminder: insights ? nextReminder : '—',
    }
  })

  const n = seniorRows.length

  let takenAll = 0
  let missedAll = 0
  let totalAll = 0
  if (insights) {
    for (const s of seniors) {
      const d = insights[s.userId]?.doses ?? []
      const sum = summarizeMedicationLine(d, now)
      takenAll += sum.taken
      missedAll += sum.missed
      totalAll += sum.total
    }
  }

  const attentionItems =
    seniorRows.length === 0
      ? [
          {
            id: 'care-empty',
            title: 'Пока нет подопечных',
            description:
              'Создайте приглашение и передайте код близкому человеку — он появится в списке.',
            level: 'watch' as const,
            timeLabel: 'Сейчас',
          },
        ]
      : (() => {
          const items: CaregiverDashboard['attentionItems'] = []
          const badName = seniors.find((s) => latestCheckinOnDay(insights?.[s.userId]?.checkins ?? [], now)?.state === 'bad')
          if (badName && insights) {
            items.push({
              id: 'wellbeing-bad',
              title: 'Отметка «плохо»',
              description: `По самочувствию у ${displayNameFromFull(badName.fullName)} последняя отметка тревожная — лучше связаться.`,
              level: 'urgent',
              timeLabel: 'Сегодня',
            })
          }
          if (missedAll > 0 && insights) {
            items.push({
              id: 'missed-doses',
              title: 'Пропущенные приёмы',
              description:
                missedAll === 1
                  ? 'За сегодня есть один пропуск по лекарствам.'
                  : `За сегодня пропущено приёмов: ${missedAll}.`,
              level: 'watch',
              timeLabel: 'Сегодня',
            })
          }
          items.push({
            id: 'care-sync',
            title: insights ? 'Данные с сервера' : 'Сеть заботы',
            description: insights
              ? 'Расписание и самочувствие подгружены из API.'
              : 'Список подопечных из вашей сети заботы.',
            level: 'calm',
            timeLabel: 'Сегодня',
          })
          return items
        })()

  const aiSummaries: string[] = []
  aiSummaries.push(
    n > 0
      ? `В сети заботы сейчас ${n} ${n === 1 ? 'подопечный' : 'подопечных'}.`
      : 'Когда появится первый подопечный, здесь будут короткие подсказки по дню.',
  )

  if (insights && n > 0) {
    const wellbeingLines: string[] = []
    for (const s of seniors) {
      const last = latestCheckinOnDay(insights[s.userId]?.checkins ?? [], now)
      const short = displayNameFromFull(s.fullName)
      if (last) {
        wellbeingLines.push(
          `${short}: самочувствие «${wellbeingShort(last.state)}» (${timeShort(last.createdAt)}).`,
        )
      } else {
        wellbeingLines.push(`${short}: сегодня ещё нет отметки о самочувствии.`)
      }
    }
    aiSummaries.push(wellbeingLines.join(' '))

    if (missedAll > 0) {
      aiSummaries.push(
        missedAll === 1
          ? 'За сегодня есть пропуск по лекарствам — при случае мягко напомните о приёме.'
          : `За сегодня пропущено приёмов: ${missedAll}. Сверьтесь с расписанием в карточке подопечного.`,
      )
    } else if (totalAll > 0) {
      aiSummaries.push('Пропусков лекарств за сегодня нет — хороший знак.')
    } else {
      aiSummaries.push('На сегодня не запланировано приёмов — проверьте курсы в разделе «Лекарства», если ожидались.')
    }
  } else {
    aiSummaries.push(
      'Короткие напоминания в одно и то же время снижают пропуски лучше, чем длинные списки.',
    )
  }

  const todayMetrics: CaregiverDashboard['todayMetrics'] = [
    { label: 'Подопечных', value: String(n), tone: 'accent' },
    { label: 'Активных связей', value: String(seniors.filter((s) => s.status === 'active').length), tone: 'warm' },
  ]

  if (insights) {
    const medValue =
      totalAll > 0
        ? `${takenAll} / ${totalAll}${missedAll > 0 ? ` · проп. ${missedAll}` : ''}`
        : '—'
    todayMetrics.push({
      label: 'Приёмы сегодня',
      value: medValue,
      tone: missedAll > 0 ? 'warm' : 'neutral',
    })
  } else {
    todayMetrics.push({ label: 'Приёмы сегодня', value: '—', tone: 'neutral' })
  }

  return {
    caregiver,
    seniors: seniorRows,
    attentionItems,
    aiSummaries,
    todayMetrics,
  }
}

function mapDoses(doses: MedicationDoseDto[]): MedicationDose[] {
  return doses.map((d) => ({
    id: d.id,
    title: d.title,
    dosageText: d.dosageText,
    instructions: d.instructions ?? '',
    plannedTime: d.plannedTime,
    status: d.status,
    confirmationRequired: d.confirmationRequired,
  }))
}

/** Главная подопечного: имя из сессии, блок про близких из GET /care/caregivers; слоты лекарств из API при передаче `doses`. */
export function buildSeniorOverviewFromApi(
  session: AuthUser,
  caregivers: CareUserSummaryDto[],
  base: SeniorOverview = seniorOverviewMock,
  doses?: MedicationDoseDto[] | null,
): SeniorOverview {
  const summary =
    caregivers.length > 0
      ? `С вами на связи ${caregivers.length} ${caregivers.length === 1 ? 'близкий человек' : 'близких'} в сети заботы.`
      : 'Когда примете приглашение от родственника, здесь появится спокойная сводка о дне.'

  const medications: MedicationDose[] =
    doses === undefined || doses === null ? base.medications : mapDoses(doses)

  return {
    ...base,
    senior: {
      ...base.senior,
      id: session.id,
      fullName: session.fullName,
      age: 0,
    },
    todaySummary: summary,
    medications,
    alerts:
      caregivers.length > 0
        ? [
            {
              id: 'caregivers-online',
              title: 'Связь с близкими',
              description: caregivers.map((c) => c.fullName).join(', '),
              level: 'calm',
              timeLabel: 'Сеть заботы',
            },
            ...base.alerts.filter((a) => a.id !== 'alert-2'),
          ]
        : base.alerts,
  }
}
