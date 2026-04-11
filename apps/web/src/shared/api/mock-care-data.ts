import type {
  AlertItem,
  CaregiverDashboard,
  CheckinEntry,
  MedicationDose,
  SeniorOverview,
} from '@altapens/shared-types'

/** Базовые демо-данные UI; при работе через backend поверх подмешиваются реальные care-списки. */
export const seniorOverviewMock: SeniorOverview = {
  senior: {
    id: 'senior-ivan',
    fullName: 'Иван Иванович',
    age: 72,
    city: 'Барнаул',
    timezone: 'Asia/Barnaul',
    fontScalePreference: 'large',
    voiceEnabled: true,
  },
  todaySummary:
    'Сегодня 3 напоминания, 1 уже подтверждено, дети видят, что вы на связи.',
  latestCheckin: {
    id: 'checkin-1',
    dateLabel: 'Сегодня, 09:10',
    state: 'good',
    note: 'Спал нормально, давление в порядке.',
  },
  medications: [
    {
      id: 'dose-1',
      title: 'Конкор',
      dosageText: '5 мг',
      instructions: 'После еды, запить водой. Не делить таблетку.',
      plannedTime: '09:00',
      status: 'taken',
      confirmationRequired: true,
    },
    {
      id: 'dose-2',
      title: 'Магний B6',
      dosageText: '1 таблетка',
      instructions: 'После еды вечером.',
      plannedTime: '14:00',
      status: 'upcoming',
      confirmationRequired: true,
    },
    {
      id: 'dose-3',
      title: 'Витамин D',
      dosageText: '1 капсула',
      instructions: 'Во время еды, не натощак.',
      plannedTime: '20:00',
      status: 'upcoming',
      confirmationRequired: false,
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      title: 'Напоминание о приёме',
      description: 'Через 40 минут нужно принять Магний B6.',
      level: 'watch',
      timeLabel: 'Сегодня',
    },
    {
      id: 'alert-2',
      title: 'Связь с Анной активна',
      description: 'Дочь Анна увидит, если вам понадобится помощь.',
      level: 'calm',
      timeLabel: 'Постоянно',
    },
  ],
  assistantMessages: [
    {
      id: 'msg-1',
      role: 'assistant',
      content:
        'Здравствуйте. Я рядом, чтобы помочь с лекарствами, самочувствием и простыми вопросами.',
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Объясни короче, зачем сегодня нужен витамин D.',
    },
    {
      id: 'msg-3',
      role: 'assistant',
      content:
        'Если говорить просто: он помогает поддерживать кости и силы. Если что-то тревожит, лучше обсудить это с врачом.',
    },
  ],
}

export const caregiverDashboardMock: CaregiverDashboard = {
  caregiver: {
    id: 'caregiver-anna',
    displayName: 'Анна',
    relationshipType: 'Дочь',
    contact: 'anna@altacare.demo',
  },
  seniors: [
    {
      id: 'senior-ivan',
      fullName: 'Иван Иванович',
      age: 72,
      currentState: 'Мне хорошо',
      attentionLevel: 'calm',
      medicationProgress: '2 из 3 приёмов сегодня',
      nextReminder: '14:00 - Магний B6',
    },
    {
      id: 'senior-elena',
      fullName: 'Елена Петровна',
      age: 68,
      currentState: 'Нужна помощь',
      attentionLevel: 'urgent',
      medicationProgress: '1 пропуск вчера',
      nextReminder: 'Сейчас - проверить связь',
    },
  ],
  attentionItems: [
    {
      id: 'attention-1',
      title: 'Вчера был пропуск',
      description: 'Иван Иванович не подтвердил вечерний приём витамина D.',
      level: 'watch',
      timeLabel: 'Вчера',
    },
    {
      id: 'attention-2',
      title: 'Кнопка экстренной помощи настроена',
      description: 'Кому звонить в тревожной ситуации — уже указано.',
      level: 'calm',
      timeLabel: 'Настроено',
    },
    {
      id: 'attention-3',
      title: 'Елена Петровна просила перезвонить',
      description: 'Статус "Нужна помощь" отправлен 12 минут назад.',
      level: 'urgent',
      timeLabel: '12 минут назад',
    },
  ],
  aiSummaries: [
    'Утром подопечные чаще подтверждают приём лекарств; вечером можно напоминать мягче, без тревоги.',
    'Короткие фразы и крупные кнопки в 9:00 и 14:00 работают лучше длинных текстов.',
  ],
  todayMetrics: [
    { label: 'Подопечных на связи', value: '2 / 2', tone: 'accent' },
    { label: 'Приёмы подтверждены', value: '5 / 6', tone: 'warm' },
    { label: 'Требуют внимания', value: '1', tone: 'neutral' },
  ],
}

export const medicationHistoryMock: MedicationDose[] = [
  ...seniorOverviewMock.medications,
  {
    id: 'dose-4',
    title: 'Витамин D',
    dosageText: '1 капсула',
    instructions: 'Во время еды.',
    plannedTime: 'Вчера, 20:00',
    status: 'missed',
    confirmationRequired: false,
  },
]

export const timelineMock: AlertItem[] = [
  ...caregiverDashboardMock.attentionItems,
  {
    id: 'timeline-4',
    title: 'Подозрительный звонок',
    description:
      'Запись о подозрительном звонке сохранена. Номер можно сразу отправить близким.',
    level: 'watch',
    timeLabel: 'Сегодня, 11:25',
  },
]

export const checkinsMock: CheckinEntry[] = [
  seniorOverviewMock.latestCheckin,
  {
    id: 'checkin-2',
    dateLabel: 'Вчера, 08:55',
    state: 'good',
    note: 'Настроение спокойное.',
  },
  {
    id: 'checkin-3',
    dateLabel: 'Позавчера, 09:20',
    state: 'need_help',
    note: 'Болела голова, дочь перезвонила.',
  },
]
