import { useMemo, useState } from 'react'
import type { AssistantMessage } from '@altapens/shared-types'
import { ActionButton, SectionCard, SectionHeader } from '@/shared/ui/primitives'

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

  const reply = useMemo(
    () =>
      compact
        ? 'Коротко: я могу объяснить проще, напомнить о лекарствах и подсказать следующий безопасный шаг.'
        : 'Я отвечу простым языком. Если вопрос связан с риском для здоровья или денег, лучше сразу подключить родственника или специалиста.',
    [compact],
  )

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Умный помощник"
        title={compact ? 'Кратко по вопросам близкого' : 'Задайте вопрос простыми словами'}
        description={
          compact
            ? 'Видно, о чём спрашивал подопечный и стоит ли вам ответить или позвонить.'
            : 'Ответы простым языком. Про здоровье и деньги лучше уточнять у врача или близких.'
        }
      />
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
            placeholder="Например: объясни короче, что делать при подозрительном звонке?"
          />
        </label>
        <div className="button-row">
          <ActionButton
            onClick={() => {
              if (!draft.trim()) {
                return
              }

              setMessages((current) => [
                ...current,
                { id: crypto.randomUUID(), role: 'user', content: draft.trim() },
                { id: crypto.randomUUID(), role: 'assistant', content: reply },
              ])
              setDraft('')
            }}
          >
            Отправить
          </ActionButton>
          <ActionButton tone="secondary">Озвучить ответ</ActionButton>
        </div>
      </div>
    </SectionCard>
  )
}
