import type { MedicationDose } from '@altapens/shared-types'

/** Небольшая случайность без шаблонного «один и тот же ответ каждый раз». */
export function pickVoiceVariant<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function pickOne<T>(items: readonly T[]): T {
  return pickVoiceVariant(items)
}

/** Одно время приёма для озвучки (коротко, по-разговорному). */
function formatOnePlannedTime(plannedTime: string): string {
  const m = plannedTime.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return plannedTime
  const h = Number(m[1])
  const min = Number(m[2])
  if (min !== 0) {
    return min === 30 ? `в ${h} с половиной` : `в ${h} часов ${min} минут`
  }
  if (h === 12) return 'в полдень'
  if (h === 0) return 'в полночь'
  if (h >= 5 && h <= 11) {
    const w = ['пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'][h - 5]
    return w ? `в ${w} утра` : `в ${h} утра`
  }
  if (h === 13) return 'в час дня'
  if (h === 14) return 'в два часа дня'
  if (h === 15) return 'в три часа дня'
  if (h === 16) return 'в четыре часа дня'
  if (h >= 17 && h <= 23) {
    const w = ['пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'][h - 17]
    return w ? `в ${w} вечера` : `в ${h} вечера`
  }
  if (h >= 1 && h <= 4) return `ночью в ${h}`
  return `в ${h} часов`
}

function formatTimesListRu(plannedTimes: string[]): string {
  const u = [...new Set(plannedTimes)].sort()
  if (u.length === 0) return ''
  if (u.length === 1) return formatOnePlannedTime(u[0]!)
  const parts = u.map(formatOnePlannedTime)
  if (parts.length === 2) return `${parts[0]} и ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')} и ${parts[parts.length - 1]}`
}

/** Тёплый ответ после успешной отметки приёма (один или несколько слотов). */
export function replyMedicationTakenSuccess(doseIds: string[], doses: MedicationDose[]): string {
  const times = doseIds
    .map((id) => doses.find((d) => d.id === id)?.plannedTime)
    .filter((t): t is string => Boolean(t))
  const timePhrase = formatTimesListRu(times)

  if (doseIds.length <= 1) {
    const detail = timePhrase
      ? `Отметила приём: ${timePhrase}.`
      : 'Отметила, что вы приняли лекарство.'
    return pickOne([
      `Вы молодец, так держать. ${detail}`,
      `Хорошо сделали. ${detail}`,
      `${detail} Молодец, что помните про таблетки.`,
      `Записала. ${detail}`,
      `${detail} Если что — я рядом.`,
    ])
  }

  const detail = timePhrase
    ? `Отметила приёмы лекарств: ${timePhrase}.`
    : `Отметила ${doseIds.length} приёма — всё записала.`
  return pickOne([
    `Вы молодец, так держать. ${detail}`,
    `Отлично, ${detail}`,
    `${detail} Так держать.`,
    `Записала всё, как вы сказали. ${detail}`,
    `${detail} Хорошо, что следуете расписанию.`,
  ])
}

export function pickMissedConfirmPrompt(title: string): string {
  return pickOne([
    `Записать пропуск для «${title}»? Скажите «да», если всё верно.`,
    `Поняла: вы не приняли «${title}». Подтвердите словом «да», если так и есть.`,
    `Сделать отметку «пропуск» для «${title}»? Скажите «да».`,
  ])
}

export function pickSnoozeConfirmPrompt(title: string): string {
  return pickOne([
    `Отложить приём «${title}»? Скажите «да», чтобы подтвердить.`,
    `Записать, что «${title}» перенесли на потом? Ответьте «да».`,
    `Поставить «позже» для «${title}»? Нужно ваше «да».`,
  ])
}

export function replyMedicationMissedRecorded(): string {
  return pickOne([
    'Пропуск записала. Если нужно, потом обсудите с врачом.',
    'Записала пропуск. Берегите себя.',
    'Поняла, пропуск сохранён.',
  ])
}

export function replyMedicationSnoozedRecorded(): string {
  return pickOne([
    'Отложила приём в записи. Напомню, когда снова откроете раздел.',
    'Записала, что отложили. Не забудьте потом.',
    'Хорошо, отложено записано.',
  ])
}

export function replyCheckinSaved(): string {
  return pickOne([
    'Сохранила, как вы себя чувствуете. Близкие это увидят.',
    'Записала ваше самочувствие. Спасибо, что поделились.',
    'Передала отметку близким. Берегите себя.',
  ])
}

export function replyVitalsNoteSaved(): string {
  return pickOne([
    'Записала ваши слова в отметку для близких.',
    'Сохранила, что вы сказали — родные смогут прочитать.',
    'Поняла, записала для близких.',
  ])
}

export function replyNavigateSos(): string {
  return pickOne([
    'Открываю экстренную помощь. Дышите спокойнее, мы рядом.',
    'Перехожу к экрану помощи. Вы не одни.',
    'Сейчас откроется экстренный раздел.',
  ])
}

export function replyUnknownCommand(): string {
  return pickOne([
    'Не разобрала. Скажите коротко: например, принял и как называется таблетка.',
    'Простите, не поняла. Повторите чуть медленнее, одной фразой.',
    'Не уловила смысл. Скажите ещё раз, как про лекарство или самочувствие.',
  ])
}

export function replyDrugNameRetryPrompt(): string {
  return pickOne([
    'Не разобрала название лекарства. Повторите, как оно называется — можно без слов «принял» и «выпил».',
    'Название не расслышала. Скажите только название или во сколько приняли.',
    'Не поняла, какое лекарство. Назовите его ещё раз, я записываю.',
  ])
}

export function replyDrugNameRetryFailed(): string {
  return pickOne([
    'Снова не разобрала. Повторите название погромче или скажите время приёма.',
    'Пока не получилось. Назовите таблетку по буквам или проверьте микрофон.',
    'Не уловила. Попробуйте короче: одно слово — название.',
  ])
}

export function replyBackendNeededForCare(): string {
  return pickOne([
    'Запись по голосу работает, когда приложение подключено к сети врача.',
    'Сейчас без связи с сервером я не могу сохранить. Проверьте интернет.',
    'Нужна связь с сервером — тогда смогу записать.',
  ])
}

export function replyConfirmCancelled(): string {
  return pickOne(['Подтверждение отменено.', 'Хорошо, отменила подтверждение.', 'Ладно, не записываю пропуск.'])
}

export function replyNoMedicationInSchedule(): string {
  return pickOne([
    'Не нашла такое лекарство в расписании на сегодня.',
    'В списке на сегодня такого не вижу. Проверьте раздел «Сегодня».',
    'Не сходится с расписанием. Может, другое название?',
  ])
}

export function replySaveError(): string {
  return pickOne([
    'Не получилось сохранить. Повторите или отметьте кнопкой.',
    'Связь подвела — попробуйте ещё раз или на экране кнопкой.',
    'Не сохранилось. Проверьте интернет и скажите снова.',
  ])
}

export function replySaveErrorShort(): string {
  return pickOne([
    'Не получилось сохранить. Попробуйте ещё раз.',
    'Ошибка записи. Повторите, пожалуйста.',
    'Не вышло сохранить. Ещё раз?',
  ])
}

export function replyMicNotAllowed(): string {
  return 'Разрешите микрофон в настройках браузера.'
}

export function replySttError(): string {
  return pickOne(['Ошибка распознавания. Повторите.', 'Не расслышала чётко. Повторите фразу.', 'Сбой распознавания — скажите ещё раз.'])
}
