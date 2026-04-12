import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AssistantMessage } from '@altapens/shared-types'
import { useAccessibilityStore } from '@/app/store/accessibility-store'
import { useAuthStore } from '@/app/store/auth-store'
import { ActionButton, SectionCard, SectionHeader } from '@/shared/ui/primitives'
import { lifeAdviceReply } from '@/features/ai-chat/life-advice'
import { postAssistantChat } from '@/shared/api/care-client'
import { useBackendApi } from '@/shared/api/api-base'
import {
  isSpeechSynthesisSupported,
  playWavBase64,
  speak,
  stopSpeaking,
} from '@/features/voice/voice-tts'

interface AssistantPanelProps {
  initialMessages: AssistantMessage[]
  compact?: boolean
}

export const AssistantPanel = ({
  initialMessages,
  compact = false,
}: AssistantPanelProps) => {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const accessToken = useAuthStore((s) => s.accessToken)
  const canUseLlmProxy = useBackendApi && Boolean(accessToken)
  const voiceEnabled = useAccessibilityStore((s) => s.voiceEnabled)
  const userSendCountRef = useRef(0)
  const spokenAssistantIdsRef = useRef<Set<string>>(new Set())

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i].content
      }
    }
    return ''
  }, [messages])

  const onSpeakLast = useCallback(() => {
    if (!lastAssistantText.trim() || !isSpeechSynthesisSupported()) {
      return
    }
    void speak(lastAssistantText)
  }, [lastAssistantText])

  /** После ответа помощника: при VITE_NEURAL_TTS — OpenAI TTS через backend; иначе WAV из интеграции (Qwen) или Web Speech. */
  useEffect(() => {
    if (!voiceEnabled) {
      return
    }
    if (userSendCountRef.current < 1) {
      return
    }
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant?.id || !lastAssistant.content.trim()) {
      return
    }
    if (spokenAssistantIdsRef.current.has(lastAssistant.id)) {
      return
    }
    spokenAssistantIdsRef.current.add(lastAssistant.id)

    const preferOpenAiNeural = import.meta.env.VITE_NEURAL_TTS === 'true'
    const audio = lastAssistant.role === 'assistant' ? lastAssistant.audioBase64Wav : undefined
    if (!preferOpenAiNeural && audio && audio.trim()) {
      void playWavBase64(audio).catch(() => {
        if (isSpeechSynthesisSupported()) {
          void speak(lastAssistant.content)
        }
      })
      return
    }
    if (isSpeechSynthesisSupported()) {
      void speak(lastAssistant.content)
    }
  }, [messages, voiceEnabled])

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Помощник"
        title={compact ? 'Кратко по вопросам близкого' : 'Вопросы быту и осторожности'}
        description={
          compact
            ? 'Что спрашивал подопечный — без диагнозов, только простые подсказки.'
            : 'Не врач и не диагноз: общеизвестные вещи и когда обратиться к специалисту.'
        }
      />
      <p className="assistant-disclaimer">
        Ответы носят справочный характер. Лечение и заключения — только у врача.
      </p>
      <div className="chat-log" aria-live="polite">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`chat-bubble chat-${message.role === 'assistant' ? 'assistant' : 'user'}`}
          >
            <strong>{message.role === 'assistant' ? 'Помощник' : 'Вы'}</strong>
            <p>{message.content}</p>
          </article>
        ))}
      </div>
      <div className="chat-actions">
        <label className="field-group">
          <span className="field-label">Новый вопрос</span>
          <textarea
            className="text-input text-area"
            rows={compact ? 3 : 4}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Например: с утра тянет в левом боку — что может быть и что делать дома?"
          />
        </label>
        <div className="button-row">
          <ActionButton
            disabled={isSending}
            onClick={() => {
              if (!draft.trim() || isSending) {
                return
              }
              const userText = draft.trim()
              setIsSending(true)

              const pushLocalReply = (answer: string, audioBase64Wav?: string) => {
                userSendCountRef.current += 1
                setMessages((current) => [
                  ...current,
                  { id: crypto.randomUUID(), role: 'user', content: userText },
                  {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: answer,
                    ...(audioBase64Wav ? { audioBase64Wav } : {}),
                  },
                ])
                setDraft('')
              }

              void (async () => {
                try {
                  if (canUseLlmProxy) {
                    const result = await postAssistantChat(userText)
                    const skipIntegrationWav = import.meta.env.VITE_NEURAL_TTS === 'true'
                    pushLocalReply(result.content, skipIntegrationWav ? undefined : result.audioBase64Wav)
                  } else {
                    pushLocalReply(lifeAdviceReply(userText))
                  }
                } catch {
                  pushLocalReply(lifeAdviceReply(userText))
                } finally {
                  setIsSending(false)
                }
              })()
            }}
          >
            Отправить
          </ActionButton>
          <ActionButton
            type="button"
            tone="secondary"
            disabled={!lastAssistantText || !isSpeechSynthesisSupported()}
            onClick={onSpeakLast}
          >
            Озвучить ответ
          </ActionButton>
          <ActionButton type="button" tone="ghost" onClick={() => stopSpeaking()}>
            Стоп
          </ActionButton>
        </div>
      </div>
    </SectionCard>
  )
}
