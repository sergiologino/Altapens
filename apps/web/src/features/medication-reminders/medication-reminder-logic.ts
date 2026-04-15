import type { MedicationDose } from '@altapens/shared-types'

export function calendarDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Слот «сейчас» по локальным часам (напоминание в эту минуту). */
export function isCurrentMinutePlanned(plannedTime: string, now: Date): boolean {
  const m = plannedTime.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return false
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false
  return now.getHours() === hh && now.getMinutes() === mm
}

/**
 * Нужно ли показать браузерное напоминание: слот в эту минуту по часам, в данных ещё «предстоит», без дубликата.
 * Не используем «эффективный» missed из care-dashboard — иначе в 09:30:05 слот уже считается пропущенным и уведомление не сработает.
 */
export function shouldNotifyMedicationDose(
  dose: MedicationDose,
  now: Date,
  alreadyNotifiedIds: Set<string>,
): boolean {
  if (alreadyNotifiedIds.has(dose.id)) return false
  if (dose.status !== 'upcoming') return false
  if (!isCurrentMinutePlanned(dose.plannedTime, now)) return false
  return true
}
