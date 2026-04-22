import type { MedicationDose } from '@altapens/shared-types'

import { isApiDoseId, parseDoseSlotId } from '@/features/voice/voice-dose-id'

export function plannedTimeToMinutes(planned: string): number | null {
  const m = planned.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  return hh * 60 + mm
}

/** Все слоты одного лекарства (один medicationId). */
export function dosesSameMedication(dose: MedicationDose, all: MedicationDose[]): MedicationDose[] {
  const p = parseDoseSlotId(dose.id)
  if (!p) return [dose]
  return all.filter((d) => {
    const q = parseDoseSlotId(d.id)
    return q && q.medicationId === p.medicationId
  })
}

/** Ближайший по времени приёма среди ещё не отмеченных как «принял». */
export function pickNearestOpenDose(candidates: MedicationDose[], now: Date): MedicationDose | null {
  const nowM = now.getHours() * 60 + now.getMinutes()
  const open = candidates.filter((d) => d.status !== 'taken' && isApiDoseId(d.id))
  if (open.length === 0) return null
  return open.reduce((best, d) => {
    const dm = plannedTimeToMinutes(d.plannedTime)
    const bm = plannedTimeToMinutes(best.plannedTime)
    if (dm == null) return best
    if (bm == null) return d
    const distD = Math.abs(dm - nowM)
    const distB = Math.abs(bm - nowM)
    return distD < distB ? d : best
  })
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening'

/** Явные часы в тексте: «в 9», «в 14:30», «на 9». */
export function extractExplicitClockMinutes(normalizedText: string): number[] {
  const t = normalizedText
  const seen = new Set<number>()
  const re = /(?:^|[\s,])(?:в|на)\s+(\d{1,2})(?:\s*[.:]\s*(\d{2}))?(?=[\s,]|$|и)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(t)) !== null) {
    const hh = Number(m[1])
    const mm = m[2] != null ? Number(m[2]) : 0
    if (!Number.isFinite(hh) || hh > 23) continue
    if (!Number.isFinite(mm) || mm > 59) continue
    seen.add(hh * 60 + mm)
  }
  return [...seen]
}

const SPECIAL_PHRASE_MINUTES: [string, number][] = [
  ['два\\s+часа\\s+дня', 14 * 60],
  ['полдень', 12 * 60],
  ['полночь', 0],
]

export function extractSpecialTimePhrases(normalizedText: string): number[] {
  const out: number[] = []
  for (const [src, mins] of SPECIAL_PHRASE_MINUTES) {
    if (new RegExp(src, 'i').test(normalizedText)) {
      out.push(mins)
    }
  }
  return out
}

export function extractDayPeriods(normalizedText: string): DayPeriod[] {
  const out: DayPeriod[] = []
  // \b плохо дружит с кириллицей в JS — ищем подстроки
  if (normalizedText.includes('утром')) out.push('morning')
  if (normalizedText.includes('днем') || normalizedText.includes('днём')) out.push('afternoon')
  if (normalizedText.includes('вечером')) out.push('evening')
  return out
}

function doseMatchesPeriod(d: MedicationDose, period: DayPeriod): boolean {
  const pm = plannedTimeToMinutes(d.plannedTime)
  if (pm == null) return false
  const h = Math.floor(pm / 60)
  if (period === 'morning') return h < 12
  if (period === 'afternoon') return h >= 12 && h < 18
  return h >= 18
}

/** Один слот под «утром» / «днём» / «вечером» — первый подходящий по времени внутри периода. */
export function pickDoseForPeriod(slots: MedicationDose[], period: DayPeriod): MedicationDose | null {
  const ok = slots.filter((d) => d.status !== 'taken' && doseMatchesPeriod(d, period))
  if (ok.length === 0) return null
  return ok.sort((a, b) => {
    const am = plannedTimeToMinutes(a.plannedTime) ?? 0
    const bm = plannedTimeToMinutes(b.plannedTime) ?? 0
    return am - bm
  })[0] ?? null
}

/** Совпадение слота с указанными минутами от полуночи (час, без минут — любые минуты в этом часу). */
export function doseMatchesClock(d: MedicationDose, targetMinutes: number, looseHourOnly: boolean): boolean {
  const pm = plannedTimeToMinutes(d.plannedTime)
  if (pm == null) return false
  if (looseHourOnly && targetMinutes % 60 === 0) {
    return Math.floor(pm / 60) === Math.floor(targetMinutes / 60)
  }
  return pm === targetMinutes
}

/**
 * Подбор слотов по явным временам и периодам суток для одного лекарства.
 */
export function resolveDosesForMedicationByRefs(
  siblings: MedicationDose[],
  clockMinutes: number[],
  periods: DayPeriod[],
): MedicationDose[] {
  const out: MedicationDose[] = []
  const used = new Set<string>()

  for (const mins of clockMinutes) {
    const loose = mins % 60 === 0
    const match = siblings.find(
      (d) => !used.has(d.id) && d.status !== 'taken' && doseMatchesClock(d, mins, loose),
    )
    if (match) {
      out.push(match)
      used.add(match.id)
    }
  }

  for (const period of periods) {
    const match = pickDoseForPeriod(
      siblings.filter((d) => !used.has(d.id)),
      period,
    )
    if (match) {
      out.push(match)
      used.add(match.id)
    }
  }

  return out
}

/**
 * Слоты по времени по всему списку (без привязки к названию): если на одно время несколько лекарств — все.
 */
export function resolveDosesByGlobalTimes(doses: MedicationDose[], clockMinutes: number[]): MedicationDose[] {
  const out: MedicationDose[] = []
  const used = new Set<string>()
  for (const mins of clockMinutes) {
    const loose = mins % 60 === 0
    for (const d of doses) {
      if (used.has(d.id) || d.status === 'taken' || !isApiDoseId(d.id)) continue
      if (doseMatchesClock(d, mins, loose)) {
        out.push(d)
        used.add(d.id)
      }
    }
  }
  return out
}
