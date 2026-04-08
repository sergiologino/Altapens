import type { MedicationDose } from '@altapens/shared-types'
import type { MedicationVoiceAction, VoiceIntent } from '@/features/voice/voice-types'

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replaceAll(/[^\p{L}\p{N}\s]/gu, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()

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

/** UUID:numeric slot — как на backend для today-doses. */
export function isApiDoseId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:\d+$/i.test(
    id,
  )
}

export function parseDoseSlotId(
  doseId: string,
): { medicationId: string; slotIndex: number } | null {
  const c = doseId.lastIndexOf(':')
  if (c < 0) return null
  const medicationId = doseId.slice(0, c)
  const slotIndex = Number(doseId.slice(c + 1))
  if (!Number.isFinite(slotIndex)) return null
  if (!isApiDoseId(doseId)) return null
  return { medicationId, slotIndex }
}

function findDoseByTranscript(transcript: string, doses: MedicationDose[]): MedicationDose | null {
  const t = normalize(transcript)
  if (!t) return null

  let best: MedicationDose | null = null
  let bestScore = 0

  for (const d of doses) {
    const title = normalize(d.title)
    if (!title) continue
    if (t.includes(title)) {
      const score = title.length
      if (score > bestScore) {
        bestScore = score
        best = d
      }
      continue
    }
    const parts = title.split(' ').filter((w) => w.length > 2)
    for (const w of parts) {
      if (t.includes(w)) {
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

function parseMedicationIntent(
  transcript: string,
  doses: MedicationDose[],
  action: MedicationVoiceAction,
): VoiceIntent {
  const keywords = action === 'taken' ? TAKEN_KW : action === 'missed' ? MISSED_KW : SNOOZE_KW
  const tail = extractAfterKeyword(transcript, keywords)
  const fragment = tail || normalize(transcript)

  let dose = findDoseByTranscript(fragment, doses)
  if (!dose && fragment.length < 4) {
    const upcoming = doses.filter((d) => d.status === 'upcoming' && isApiDoseId(d.id))
    if (upcoming.length === 1) {
      dose = upcoming[0] ?? null
    }
  }

  if (!dose || !isApiDoseId(dose.id)) {
    return { type: 'unknown' }
  }

  return { type: 'medication', doseId: dose.id, action }
}

export function parseTranscriptToIntent(transcript: string, doses: MedicationDose[]): VoiceIntent {
  const raw = transcript.trim()
  if (!raw) {
    return { type: 'unknown' }
  }

  const n = normalize(raw)

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
      return parseMedicationIntent(raw, doses, 'missed')
    }
  }
  for (const kw of SNOOZE_KW) {
    if (n.includes(kw)) {
      return parseMedicationIntent(raw, doses, 'snoozed')
    }
  }
  for (const kw of TAKEN_KW) {
    if (hasPositiveTakenKeyword(n, kw)) {
      return parseMedicationIntent(raw, doses, 'taken')
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
        return { type: 'medication', doseId: maybeDose.id, action: 'taken' }
      }
    }
    if (n.includes('уже')) {
      return { type: 'medication', doseId: maybeDose.id, action: 'taken' }
    }
  }

  return { type: 'unknown' }
}
