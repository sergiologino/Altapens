/** Короткие озвучки при смене экрана (senior). */

export function routeVoiceIntro(pathname: string): string | null {
  const p = pathname.replace(/\/$/, '') || '/senior'
  switch (p) {
    case '/senior':
      return 'Главная. Удерживайте кнопку микрофона, говорите, затем отпустите. Про самочувствие скажите: мне хорошо, нужна помощь, или плохо.'
    case '/senior/today':
      return 'Лекарства на сегодня. Скажите, что вы приняли, или название таблетки.'
    case '/senior/assistant':
      return 'Помощник.'
    case '/senior/history':
      return 'История.'
    case '/senior/profile':
      return 'Настройки.'
    case '/senior/sos':
      return 'Экстренная помощь. Скажите, что случилось, или нажмите кнопку.'
    case '/senior/anti-scam':
      return 'Защита от обмана.'
    default:
      return null
  }
}
