/** Десять цифр после +7: 3 — код оператора (ABC), 7 — номер абонента. В API уходит «7» + эти 10 цифр. */
export const RU_PHONE_AFTER_SEVEN_LEN = 10

/** Только цифры после странового «7», не более 10. */
export function normalizeRuPhoneDigitsFromInput(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8') && d.length > 1) {
    d = `7${d.slice(1)}`
  }
  if (d.startsWith('7')) {
    d = d.slice(1)
  }
  return d.slice(0, RU_PHONE_AFTER_SEVEN_LEN)
}

/** Отображение: +7 (XXX) XXXXXXX */
export function formatRuPhoneDisplay(afterSevenDigits: string): string {
  const d = afterSevenDigits.replace(/\D/g, '').slice(0, RU_PHONE_AFTER_SEVEN_LEN)
  if (d.length === 0) return '+7 '
  if (d.length < 3) {
    return `+7 (${d}`
  }
  return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`
}

export function ruPhoneToPayload(afterSevenDigits: string): string {
  const d = afterSevenDigits.replace(/\D/g, '').slice(0, RU_PHONE_AFTER_SEVEN_LEN)
  return d.length ? `7${d}` : ''
}

export function payloadToAfterSeven(phonePayload: string): string {
  const d = phonePayload.replace(/\D/g, '')
  if (d.startsWith('7') && d.length > 1) {
    return d.slice(1, 1 + RU_PHONE_AFTER_SEVEN_LEN)
  }
  return d.slice(0, RU_PHONE_AFTER_SEVEN_LEN)
}
