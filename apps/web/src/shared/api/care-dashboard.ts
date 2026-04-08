import type { CareUserSummaryDto, MedicationDoseDto } from '@altapens/api-contracts'
import type { AuthUser, CaregiverDashboard, MedicationDose, SeniorOverview } from '@altapens/shared-types'

import { seniorOverviewMock } from '@/shared/api/mock-care-data'

const displayNameFromFull = (fullName: string) => {
  const part = fullName.trim().split(/\s+/)[0]
  return part || fullName
}

/** Сводка опекуна из сессии + список подопечных с backend. */
export function buildCaregiverDashboardFromApi(
  session: AuthUser,
  seniors: CareUserSummaryDto[],
): CaregiverDashboard {
  const caregiver = {
    id: session.id,
    displayName: displayNameFromFull(session.fullName),
    relationshipType: 'Семья',
    contact: session.email,
  }

  const seniorRows = seniors.map((s) => ({
    id: s.userId,
    fullName: s.fullName,
    age: 0,
    currentState: s.status === 'active' ? 'На связи' : '—',
    attentionLevel: 'calm' as const,
    medicationProgress: 'Расписание лекарств — в следующих версиях',
    nextReminder: '—',
  }))

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
      : [
          {
            id: 'care-sync',
            title: 'Данные с сервера',
            description: 'Список подопечных загружен из вашей сети заботы.',
            level: 'calm' as const,
            timeLabel: 'Сегодня',
          },
        ]

  const n = seniorRows.length
  return {
    caregiver,
    seniors: seniorRows,
    attentionItems,
    aiSummaries: [
      n > 0
        ? `В сети заботы сейчас ${n} ${n === 1 ? 'подопечный' : 'подопечных'}.`
        : 'Когда появится первый подопечный, здесь будут короткие подсказки по дню.',
      'Отметки самочувствия и история пропусков подключим отдельным API.',
    ],
    todayMetrics: [
      { label: 'Подопечных', value: String(n), tone: 'accent' },
      { label: 'Активных связей', value: String(seniors.filter((s) => s.status === 'active').length), tone: 'warm' },
      { label: 'Лекарства (демо)', value: '—', tone: 'neutral' },
    ],
  }
}

function mapDoses(doses: MedicationDoseDto[]): MedicationDose[] {
  return doses.map((d) => ({
    id: d.id,
    title: d.title,
    dosageText: d.dosageText,
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
