import { pickVoiceVariant } from '@/features/voice/voice-natural-replies'

/** Озвучки при смене экрана (senior): несколько вариантов, звучат по-человечески. */

const home = [
  'Главная. Удерживайте кнопку микрофона, говорите и отпустите. Про самочувствие можно сказать: мне хорошо, нужна помощь или плохо — я передам близким.',
  'Вы на главной. Зажмите микрофон и скажите, что нужно: про таблетки, самочувствие или помощь.',
  'Главный экран. Микрофон снизу: удержали, сказали фразу, отпустили. Я постараюсь понять с первого раза.',
]

const today = [
  'Сегодня — лекарства на день. Скажите, что уже приняли, или назовите таблетку.',
  'Здесь расписание на сегодня. Можно сказать: принял и название, или просто название лекарства.',
  'Экран «Сегодня». Говорите, какие приёмы уже сделали — я отмечу в списке.',
]

const assistant = [
  'Помощник. Здесь можно задать бытовой вопрос — без диагнозов, только простые подсказки.',
  'Раздел помощника. Спросите, что волнует — я отвечу простыми словами.',
]

const history = [
  'История — что было с самочувствием и лекарствами.',
  'Здесь прошлые отметки: самочувствие и приёмы.',
]

const profile = [
  'Настройки экрана и напоминаний.',
  'Профиль: размер букв, тема, озвучка и напоминания о лекарствах.',
]

const sos = [
  'Экстренная помощь. Если плохо — скажите вслух или нажмите кнопку. Рядом будут подсказки.',
  'Экстренный экран. Не стесняйтесь позвать помощь — кнопки крупные, всё видно.',
]

const antiScam = [
  'Защита от обмана — если звонок подозрительный, здесь подскажут, что делать.',
  'Экран против мошенников: спокойно, шаг за шагом.',
]

export function routeVoiceIntro(pathname: string): string | null {
  const p = pathname.replace(/\/$/, '') || '/senior'
  switch (p) {
    case '/senior':
      return pickVoiceVariant(home)
    case '/senior/today':
      return pickVoiceVariant(today)
    case '/senior/assistant':
      return pickVoiceVariant(assistant)
    case '/senior/history':
      return pickVoiceVariant(history)
    case '/senior/profile':
      return pickVoiceVariant(profile)
    case '/senior/sos':
      return pickVoiceVariant(sos)
    case '/senior/anti-scam':
      return pickVoiceVariant(antiScam)
    default:
      return null
  }
}
