import type { MedicationDose } from '@altapens/shared-types'
import type { MedicationVoiceAction, VoiceIntent } from '@/features/voice/voice-types'
import { isApiDoseId } from '@/features/voice/voice-dose-id'
import {
  dosesSameMedication,
  extractDayPeriods,
  extractExplicitClockMinutes,
  extractSpecialTimePhrases,
  pickNearestOpenDose,
  resolveDosesByGlobalTimes,
  resolveDosesForMedicationByRefs,
} from '@/features/voice/voice-medication-resolve'

export { isApiDoseId, parseDoseSlotId } from '@/features/voice/voice-dose-id'

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replaceAll(/[^\p{L}\p{N}\s]/gu, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()

/** Сведение латиницы/кириллицы в названиях (B6 в списке vs «б6» в речи). */
const foldDrugTokens = (s: string) =>
  normalize(s)
    .replace(/[bб](?=\d)/gi, 'в')
    .replace(/b/gi, 'в')
    .replace(/\s+/g, '')

const SOS_HINTS = [
  'позвонить',
  'позвони',
  'срочно',
  'скорая',
  'экстрен',
  'помогите срочно',
  'вызови скорую',
  'нужен врач',
]

const CONFIRM_PREFIXES = ['да', 'верно', 'подтверждаю', 'ага', 'конечно', 'точно']

const VITALS_HINTS = [
  'давлени',
  'пульс',
  'сахар',
  'гликем',
  'тонометр',
  'измерил',
  'показани',
]

function hasSosIntent(n: string): boolean {
  return SOS_HINTS.some((h) => n.includes(h))
}

function isConfirmYes(n: string): boolean {
  return CONFIRM_PREFIXES.some(
    (p) => n === p || n.startsWith(`${p} `) || n.startsWith(`${p},`),
  )
}

function hasVitalsHint(n: string): boolean {
  if (/\d+\s*(на|к|\/)\s*\d+/.test(n)) return true
  return VITALS_HINTS.some((h) => n.includes(h))
}

function findDoseByTranscript(transcript: string, doses: MedicationDose[]): MedicationDose | null {
  const t = normalize(transcript)
  const tFold = foldDrugTokens(transcript)
  if (!t) return null

  let best: MedicationDose | null = null
  let bestScore = 0

  for (const d of doses) {
    const title = normalize(d.title)
    const titleFold = foldDrugTokens(d.title)
    if (!title) continue
    if (t.includes(title) || (titleFold.length >= 3 && tFold.includes(titleFold))) {
      const score = title.length
      if (score > bestScore) {
        bestScore = score
        best = d
      }
      continue
    }
    const parts = title.split(' ').filter((w) => w.length > 2)
    for (const w of parts) {
      const wFold = foldDrugTokens(w)
      if (t.includes(w) || (wFold.length >= 2 && tFold.includes(wFold))) {
        const score = w.length
        if (score > bestScore) {
          bestScore = score
          best = d
        }
      }
    }
  }

  return best
}

/** «не принял» не считаем за «принял» (\b в JS не годится для кириллицы). */
function hasPositiveTakenKeyword(text: string, kw: string): boolean {
  let idx = 0
  while ((idx = text.indexOf(kw, idx)) >= 0) {
    const before = text.slice(0, idx).trimEnd()
    if (!before.endsWith('не')) {
      return true
    }
    idx += kw.length
  }
  return false
}

function extractAfterKeyword(text: string, keywords: string[]): string {
  const t = normalize(text)
  for (const kw of keywords) {
    const i = t.indexOf(kw)
    if (i >= 0) {
      return t.slice(i + kw.length).trim()
    }
  }
  return ''
}

const TAKEN_KW = ['выпил', 'выпила', 'принял', 'приняла', 'приняли', 'проглотил', 'проглотила']
const MISSED_KW = [
  'не принял',
  'не приняла',
  'не выпил',
  'пропустили',
  'пропустила',
  'пропустил',
  'не пил',
]
const SNOOZE_KW = ['позже', 'отложил', 'отложила', 'попозже', 'перенес', 'перенесу']

function hasTakenVerb(n: string): boolean {
  return TAKEN_KW.some((kw) => hasPositiveTakenKeyword(n, kw))
}

function mergeUniqueMinutes(lists: number[][]): number[] {
  const s = new Set<number>()
  for (const list of lists) {
    for (const x of list) {
      s.add(x)
    }
  }
  return [...s].sort((a, b) => a - b)
}

function extractTailForAction(raw: string, action: MedicationVoiceAction): string {
  if (action === 'taken') return extractAfterKeyword(raw, TAKEN_KW)
  if (action === 'missed') return extractAfterKeyword(raw, MISSED_KW)
  return extractAfterKeyword(raw, SNOOZE_KW)
}

function resolveMedicationDoses(
  action: MedicationVoiceAction,
  raw: string,
  n: string,
  doses: MedicationDose[],
  now: Date,
): { doseIds: string[] } | null {
  const tail = extractTailForAction(raw, action)
  const fragmentForDrug = tail || raw

  const clocks = mergeUniqueMinutes([
    extractExplicitClockMinutes(n),
    extractSpecialTimePhrases(n),
  ])
  const periods = extractDayPeriods(n)

  const drugGuess =
    findDoseByTranscript(raw, doses) ??
    findDoseByTranscript(fragmentForDrug, doses) ??
    findDoseByTranscript(tail, doses)

  if (drugGuess && isApiDoseId(drugGuess.id)) {
    const siblings = dosesSameMedication(drugGuess, doses)
    const pool = siblings.filter((d) => d.status !== 'taken')

    if (clocks.length > 0 || periods.length > 0) {
      const resolved = resolveDosesForMedicationByRefs(pool, clocks, periods)
      if (resolved.length > 0) {
        const ids = resolved.map((d) => d.id).filter(isApiDoseId)
        return ids.length ? { doseIds: ids } : null
      }
    }

    const pick = pickNearestOpenDose(siblings, now)
    if (pick && isApiDoseId(pick.id)) {
      return { doseIds: [pick.id] }
    }
    return null
  }

  if (clocks.length > 0) {
    const globalHits = resolveDosesByGlobalTimes(doses, clocks)
    if (globalHits.length > 0) {
      return { doseIds: globalHits.map((d) => d.id).filter(isApiDoseId) }
    }
  }

  const upcomingOnly = doses.filter((d) => d.status === 'upcoming' && isApiDoseId(d.id))
  if (upcomingOnly.length === 1 && action === 'taken') {
    const only = upcomingOnly[0]
    if (only) {
      return { doseIds: [only.id] }
    }
  }

  return null
}

function parseMedicationIntent(
  transcript: string,
  doses: MedicationDose[],
  action: MedicationVoiceAction,
  now: Date,
): VoiceIntent {
  const n = normalize(transcript)
  const resolved = resolveMedicationDoses(action, transcript, n, doses, now)
  if (!resolved || resolved.doseIds.length === 0) {
    if (action === 'taken' && hasTakenVerb(n)) {
      return { type: 'medication_not_recognized' }
    }
    return { type: 'unknown' }
  }
  return { type: 'medication', doseIds: resolved.doseIds, action }
}

export type ParseIntentOptions = {
  /** Повтор только названия после «не разобрала название». */
  mode?: 'drug_name_repeat'
  expectedAction?: MedicationVoiceAction
  /** Для тестов: момент времени при выборе «ближайшего» приёма */
  at?: Date
}

function resolveDrugNameRepeat(transcript: string, doses: MedicationDose[], now: Date): VoiceIntent {
  const n = normalize(transcript)
  const clocks = mergeUniqueMinutes([
    extractExplicitClockMinutes(n),
    extractSpecialTimePhrases(n),
  ])
  const periods = extractDayPeriods(n)

  const drugGuess = findDoseByTranscript(transcript, doses)
  if (drugGuess && isApiDoseId(drugGuess.id)) {
    const siblings = dosesSameMedication(drugGuess, doses)
    const openSiblings = siblings.filter((d) => d.status !== 'taken')
    if (clocks.length > 0 || periods.length > 0) {
      const resolved = resolveDosesForMedicationByRefs(openSiblings, clocks, periods)
      if (resolved.length > 0) {
        return {
          type: 'medication',
          doseIds: resolved.map((d) => d.id).filter(isApiDoseId),
          action: 'taken',
        }
      }
    }
    const nearest = pickNearestOpenDose(siblings, now)
    if (nearest && isApiDoseId(nearest.id)) {
      return { type: 'medication', doseIds: [nearest.id], action: 'taken' }
    }
  }

  if (clocks.length > 0) {
    const globalHits = resolveDosesByGlobalTimes(doses, clocks)
    if (globalHits.length > 0) {
      return {
        type: 'medication',
        doseIds: globalHits.map((d) => d.id).filter(isApiDoseId),
        action: 'taken',
      }
    }
  }

  return { type: 'unknown' }
}

export function parseTranscriptToIntent(
  transcript: string,
  doses: MedicationDose[],
  options?: ParseIntentOptions,
): VoiceIntent {
  const now = options?.at ?? new Date()
  const raw = transcript.trim()
  if (!raw) {
    return { type: 'unknown' }
  }

  const n = normalize(raw)

  if (options?.mode === 'drug_name_repeat') {
    return resolveDrugNameRepeat(raw, doses, now)
  }

  if (isConfirmYes(n)) {
    return { type: 'confirm_yes' }
  }

  if (hasSosIntent(n)) {
    return { type: 'navigate_sos' }
  }

  if (hasVitalsHint(n)) {
    return { type: 'vitals_note', note: raw.slice(0, 500) }
  }

  for (const kw of MISSED_KW) {
    if (n.includes(kw)) {
      return parseMedicationIntent(raw, doses, 'missed', now)
    }
  }
  for (const kw of SNOOZE_KW) {
    if (n.includes(kw)) {
      return parseMedicationIntent(raw, doses, 'snoozed', now)
    }
  }
  for (const kw of TAKEN_KW) {
    if (hasPositiveTakenKeyword(n, kw)) {
      return parseMedicationIntent(raw, doses, 'taken', now)
    }
  }

  if (
    n.includes('мне хорошо') ||
    n.includes('хорошо себя') ||
    n.includes('чувствую себя хорошо') ||
    n.includes('нормально себя') ||
    n.includes('все хорошо') ||
    n === 'хорошо'
  ) {
    return { type: 'checkin', state: 'good' }
  }
  if (
    n.includes('нужна помощь') ||
    n.includes('помогите') ||
    n.includes('боюсь') ||
    n.includes('тревожно') ||
    n.includes('не могу')
  ) {
    return { type: 'checkin', state: 'need_help' }
  }
  if (
    n.includes('плохо себя') ||
    n.includes('очень плохо') ||
    n.includes('тошнит') ||
    n.includes('голова болит') ||
    n.includes('болит') ||
    n.includes('слабость') ||
    n === 'плохо'
  ) {
    return { type: 'checkin', state: 'bad', note: raw.length > 120 ? raw.slice(0, 500) : undefined }
  }

  const maybeDose = findDoseByTranscript(raw, doses)
  if (maybeDose && isApiDoseId(maybeDose.id)) {
    for (const w of ['принял', 'выпил', 'приняла', 'выпила']) {
      if (hasPositiveTakenKeyword(n, w)) {
        const r = resolveMedicationDoses('taken', raw, n, doses, now)
        if (r && r.doseIds.length > 0) {
          return { type: 'medication', doseIds: r.doseIds, action: 'taken' }
        }
        return { type: 'medication_not_recognized' }
      }
    }
    if (n.includes('уже')) {
      const r = resolveMedicationDoses('taken', raw, n, doses, now)
      if (r && r.doseIds.length > 0) {
        return { type: 'medication', doseIds: r.doseIds, action: 'taken' }
      }
    }
  }

  return { type: 'unknown' }
}
