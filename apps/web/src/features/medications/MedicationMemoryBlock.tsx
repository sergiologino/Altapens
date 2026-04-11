import { ActionButton } from '@/shared/ui/primitives'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '@/features/voice/voice-tts'

type Props = {
  title: string
  dosageText: string
  instructions: string
  /** Скрыть кнопки озвучки (например, если в профиле отключена озвучка экрана) */
  hideSpeakButtons?: boolean
}

/** Текст памятки куратора + опционально озвучка для подопечного */
export function MedicationMemoryBlock({ title, dosageText, instructions, hideSpeakButtons }: Props) {
  const text = instructions.trim()
  if (!text) {
    return null
  }

  const fullForSpeech = `${title}, ${dosageText}. ${text}`

  return (
    <div className="medication-memory-block">
      <p className="field-label">Как принимать</p>
      <p className="medication-memory-text">{text}</p>
      {!hideSpeakButtons && isSpeechSynthesisSupported() ? (
        <div className="button-row wrap-row">
          <ActionButton
            type="button"
            tone="secondary"
            className="senior-cta"
            onClick={() => {
              void speak(fullForSpeech)
            }}
          >
            Озвучить памятку
          </ActionButton>
          <ActionButton
            type="button"
            tone="ghost"
            className="senior-cta"
            onClick={() => stopSpeaking()}
          >
            Стоп
          </ActionButton>
        </div>
      ) : null}
    </div>
  )
}
