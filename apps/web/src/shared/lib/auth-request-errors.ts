/** Сообщения для сетевых сбоев fetch на формах входа/регистрации */
export function formatAuthRequestError(e: unknown): string {
  if (!(e instanceof Error)) {
    return 'Не удалось выполнить запрос. Проверьте интернет и попробуйте снова.'
  }
  const m = e.message
  if (
    m === 'Failed to fetch' ||
    /networkerror|load failed|fetch failed/i.test(m) ||
    m === 'Network request failed'
  ) {
    return (
      'Нет связи с сервером. Проверьте интернет. ' +
      'В приложении на телефоне адрес API должен быть доступен с устройства (не localhost с вашего ПК); ' +
      'при необходимости пересоберите APK командой prepare:www из папки Mobile_version.'
    )
  }
  return m
}
