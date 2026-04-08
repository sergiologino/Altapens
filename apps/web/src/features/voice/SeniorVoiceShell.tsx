import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccessibilityStore } from '@/app/store/accessibility-store'
import { useBackendApi } from '@/shared/api/api-base'
import { useRecordMedicationIntakeMutation, useRecordWellbeingCheckinMutation } from '@/shared/api/care-client'
import { useSeniorOverviewQuery } from '@/shared/api/mock-api'
import {
  parseDoseSlotId,
  parseTranscriptToIntent,
} from '@/features/voice/voice-intents'
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
        await speak('Не могу отметить без подключения к сети врача.')
        setPending(null)
        return
      }
      try {
        await intake.mutateAsync({
          medicationId: parsed.medicationId,
          slotIndex: parsed.slotIndex,
          status: pending.action === 'missed' ? 'missed' : 'snoozed',
        })
        await speak(pending.action === 'missed' ? 'Пропуск записан.' : 'Отложено записано.')
      } catch {
        await speak('Не получилось сохранить. Попробуйте ещё раз.')
      }
      setPending(null)
    }

    if (pending) {
      const intentEarly = parseTranscriptToIntent(raw, doses)
      if (intentEarly.type === 'confirm_yes') {
        await execPendingYes()
        return
      }
      setPending(null)
      await speak('Подтверждение отменено. Скажите команду снова.')
    }

    const intent = parseTranscriptToIntent(raw, doses)

    switch (intent.type) {
      case 'navigate_sos': {
        await speak('Открываю экстренную помощь.')
        navigate('/senior/sos')
        break
      }
      case 'checkin': {
        if (!useHttp) {
          await speak('Запись самочувствия по голосу работает при подключении приложения к сети врача.')
          break
        }
        try {
          await checkin.mutateAsync({
            state: intent.state,
            note: intent.note,
          })
          await speak('Сохранила, как вы себя чувствуете.')
        } catch {
          await speak('Не получилось сохранить. Проверьте связь.')
        }
        break
      }
      case 'vitals_note': {
        if (!useHttp) {
          await speak('Запись показателей нужна при подключении к сети врача.')
          break
        }
        try {
          await checkin.mutateAsync({
            state: 'good',
            note: intent.note,
          })
          await speak('Записала ваши слова в отметку для близких.')
        } catch {
          await speak('Не получилось сохранить. Проверьте связь.')
        }
        break
      }
      case 'medication': {
        if (!useHttp) {
          await speak(
            'Запись приёма таблеток по голосу работает, когда приложение подключено к сети врача.',
          )
          break
        }
        const parsed = parseDoseSlotId(intent.doseId)
        if (!parsed) {
          await speak('Не нашла подходящее лекарство в расписании на сегодня.')
          break
        }
        if (intent.action === 'missed' || intent.action === 'snoozed') {
          const title = doses.find((d) => d.id === intent.doseId)?.title ?? 'лекарство'
          setPending({
            kind: 'medication',
            doseId: intent.doseId,
            action: intent.action,
            title,
          })
          await speak(
            intent.action === 'missed'
              ? `Записать пропуск для «${title}»? Скажите «да», чтобы подтвердить.`
              : `Отложить приём «${title}»? Скажите «да», чтобы подтвердить.`,
          )
          break
        }
        try {
          await intake.mutateAsync({
            medicationId: parsed.medicationId,
            slotIndex: parsed.slotIndex,
            status: 'taken',
          })
          await speak('Отметила, что вы приняли лекарство.')
        } catch {
          await speak('Не получилось сохранить. Повторите или отметьте кнопкой.')
        }
        break
      }
      case 'unknown':
      default:
        await speak('Не разобрала. Скажите коротко, например: принял и название таблетки.')
    }
  }

  const onPointerDown = () => {
    if (!voiceEnabled || busy) return
    if (!sttOk) {
      if (ttsOk) void speak('Голосовой ввод в этом браузере недоступен. Пользуйтесь кнопками.')
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
          setStatusLine('Разрешите микрофон в настройках браузера.')
        } else if (code !== 'aborted') {
          setStatusLine('Ошибка распознавания. Повторите.')
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
