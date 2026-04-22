import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccessibilityStore } from '@/app/store/accessibility-store'
import { useBackendApi } from '@/shared/api/api-base'
import { useRecordMedicationIntakeMutation, useRecordWellbeingCheckinMutation } from '@/shared/api/care-client'
import { useSeniorOverviewQuery } from '@/shared/api/mock-api'
import { parseDoseSlotId } from '@/features/voice/voice-dose-id'
import { parseTranscriptToIntent } from '@/features/voice/voice-intents'
import {
  pickVoiceVariant,
  replyBackendNeededForCare,
  replyCheckinSaved,
  replyConfirmCancelled,
  replyDrugNameRetryFailed,
  replyDrugNameRetryPrompt,
  pickMissedConfirmPrompt,
  pickSnoozeConfirmPrompt,
  replyMedicationMissedRecorded,
  replyMedicationSnoozedRecorded,
  replyMedicationTakenSuccess,
  replyMicNotAllowed,
  replyNavigateSos,
  replyNoMedicationInSchedule,
  replySaveError,
  replySaveErrorShort,
  replySttError,
  replyUnknownCommand,
  replyVitalsNoteSaved,
} from '@/features/voice/voice-natural-replies'
import { routeVoiceIntro } from '@/features/voice/voice-route-prompts'
import { runSpeechSession, isSpeechRecognitionSupported } from '@/features/voice/voice-stt'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '@/features/voice/voice-tts'
import type { PendingVoiceAction } from '@/features/voice/voice-types'

export function SeniorVoiceShell() {
  const voiceEnabled = useAccessibilityStore((s) => s.voiceEnabled)
  const location = useLocation()
  const navigate = useNavigate()
  const useHttp = useBackendApi
  const { data: overview } = useSeniorOverviewQuery()

  const intake = useRecordMedicationIntakeMutation()
  const checkin = useRecordWellbeingCheckinMutation()

  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [statusLine, setStatusLine] = useState('')
  const [pending, setPending] = useState<PendingVoiceAction>(null)

  const sessionRef = useRef<{ stop: () => void } | null>(null)
  const prevPathRef = useRef<string>('')

  const doses = overview?.medications ?? []
  const sttOk = isSpeechRecognitionSupported()
  const ttsOk = isSpeechSynthesisSupported()
  const busy = intake.isPending || checkin.isPending

  useEffect(() => {
    if (!voiceEnabled || !ttsOk) return
    if (prevPathRef.current === location.pathname) return
    prevPathRef.current = location.pathname
    const intro = routeVoiceIntro(location.pathname)
    if (!intro) return
    const id = window.setTimeout(() => {
      void speak(intro)
    }, 450)
    return () => clearTimeout(id)
  }, [location.pathname, voiceEnabled, ttsOk])

  const releasePointer = () => {
    sessionRef.current?.stop()
    sessionRef.current = null
    setListening(false)
    setInterim('')
    window.setTimeout(() => setStatusLine(''), 600)
  }

  const processFinal = async (text: string) => {
    const raw = text.trim()
    setInterim('')
    if (!raw) {
      return
    }

    const execPendingYes = async () => {
      if (!pending || pending.kind !== 'medication') return
      const parsed = parseDoseSlotId(pending.doseId)
      if (!parsed || !useHttp) {
        await speak(replyBackendNeededForCare())
        setPending(null)
        return
      }
      try {
        await intake.mutateAsync({
          medicationId: parsed.medicationId,
          slotIndex: parsed.slotIndex,
          status: pending.action === 'missed' ? 'missed' : 'snoozed',
        })
        await speak(
          pending.action === 'missed' ? replyMedicationMissedRecorded() : replyMedicationSnoozedRecorded(),
        )
      } catch {
        await speak(replySaveErrorShort())
      }
      setPending(null)
    }

    if (pending?.kind === 'drug_name_retry') {
      const intent = parseTranscriptToIntent(raw, doses, {
        mode: 'drug_name_repeat',
        at: new Date(),
      })
      if (intent.type === 'medication' && intent.action === 'taken') {
        if (!useHttp) {
          await speak(replyBackendNeededForCare())
          setPending(null)
          return
        }
        const uniqueIds = [...new Set(intent.doseIds)]
        try {
          for (const did of uniqueIds) {
            const parsed = parseDoseSlotId(did)
            if (!parsed) continue
            await intake.mutateAsync({
              medicationId: parsed.medicationId,
              slotIndex: parsed.slotIndex,
              status: 'taken',
            })
          }
          await speak(replyMedicationTakenSuccess(uniqueIds, doses))
          setPending(null)
        } catch {
          await speak(replySaveError())
        }
        return
      }
      await speak(replyDrugNameRetryFailed())
      return
    }

    if (pending?.kind === 'medication') {
      const intentEarly = parseTranscriptToIntent(raw, doses)
      if (intentEarly.type === 'confirm_yes') {
        await execPendingYes()
        return
      }
      setPending(null)
      await speak(replyConfirmCancelled())
    }

    const intent = parseTranscriptToIntent(raw, doses)

    switch (intent.type) {
      case 'navigate_sos': {
        await speak(replyNavigateSos())
        navigate('/senior/sos')
        break
      }
      case 'checkin': {
        if (!useHttp) {
          await speak(replyBackendNeededForCare())
          break
        }
        try {
          await checkin.mutateAsync({
            state: intent.state,
            note: intent.note,
          })
          await speak(replyCheckinSaved())
        } catch {
          await speak(replySaveErrorShort())
        }
        break
      }
      case 'vitals_note': {
        if (!useHttp) {
          await speak(replyBackendNeededForCare())
          break
        }
        try {
          await checkin.mutateAsync({
            state: 'good',
            note: intent.note,
          })
          await speak(replyVitalsNoteSaved())
        } catch {
          await speak(replySaveErrorShort())
        }
        break
      }
      case 'medication': {
        if (!useHttp) {
          await speak(replyBackendNeededForCare())
          break
        }
        const ids = [...new Set(intent.doseIds)].filter((id) => parseDoseSlotId(id))
        if (ids.length === 0) {
          await speak(replyNoMedicationInSchedule())
          break
        }
        if (intent.action === 'missed' || intent.action === 'snoozed') {
          const firstId = ids[0]!
          const title = doses.find((d) => d.id === firstId)?.title ?? 'лекарство'
          setPending({
            kind: 'medication',
            doseId: firstId,
            action: intent.action,
            title,
          })
          await speak(
            intent.action === 'missed'
              ? pickMissedConfirmPrompt(title)
              : pickSnoozeConfirmPrompt(title),
          )
          break
        }
        try {
          for (const did of ids) {
            const parsed = parseDoseSlotId(did)
            if (!parsed) continue
            await intake.mutateAsync({
              medicationId: parsed.medicationId,
              slotIndex: parsed.slotIndex,
              status: 'taken',
            })
          }
          await speak(replyMedicationTakenSuccess(ids, doses))
        } catch {
          await speak(replySaveError())
        }
        break
      }
      case 'medication_not_recognized': {
        if (!useHttp) {
          await speak(replyBackendNeededForCare())
          break
        }
        setPending({ kind: 'drug_name_retry', action: 'taken' })
        await speak(replyDrugNameRetryPrompt())
        break
      }
      case 'unknown':
      default:
        await speak(replyUnknownCommand())
    }
  }

  const onPointerDown = () => {
    if (!voiceEnabled || busy) return
    if (!sttOk) {
      if (ttsOk) {
        void speak(
          pickVoiceVariant([
            'Голосовой ввод в этом браузере недоступен. Пользуйтесь кнопками.',
            'Распознавание речи здесь не работает — лучше нажимайте кнопки на экране.',
          ]),
        )
      }
      return
    }
    stopSpeaking()
    setListening(true)
    setStatusLine('Слушаю… Вас записывают, отпустите кнопку, когда закончите.')
    const started = runSpeechSession({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        void processFinal(t)
      },
      onError: (code) => {
        if (code === 'no-speech') {
          setStatusLine('Не расслышала. Попробуйте ещё раз.')
        } else if (code === 'not-allowed') {
          setStatusLine(replyMicNotAllowed())
        } else if (code !== 'aborted') {
          setStatusLine(replySttError())
        }
      },
    })
    if (!started) {
      setListening(false)
      setStatusLine('')
      return
    }
    sessionRef.current = started
  }

  if (!voiceEnabled) {
    return null
  }

  return (
    <div className="senior-voice-dock" aria-label="Голосовые команды">
      <div className="senior-voice-dock-inner">
        <button
          type="button"
          className={listening ? 'senior-voice-mic listening' : 'senior-voice-mic'}
          disabled={busy}
          onPointerDown={onPointerDown}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onPointerLeave={(e) => {
            if (e.buttons === 0) releasePointer()
          }}
          aria-pressed={listening}
        >
          {listening ? 'Говорите…' : 'Удерживайте и говорите'}
        </button>
        <p className="senior-voice-status" aria-live="polite">
          {interim ? interim : statusLine}
        </p>
        {busy ? <p className="senior-voice-status">Сохраняю…</p> : null}
      </div>
    </div>
  )
}
