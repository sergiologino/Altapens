import { useState } from 'react'
import { ActionButton, Pill, SectionCard, SectionHeader } from '@/shared/ui/primitives'
import type { HealthState } from '@altapens/shared-types'

const labels: Record<HealthState, string> = {
  good: 'Мне хорошо',
  need_help: 'Нужна помощь',
  bad: 'Плохо себя чувствую',
}

const tones: Record<HealthState, 'calm' | 'watch' | 'urgent'> = {
  good: 'calm',
  need_help: 'watch',
  bad: 'urgent',
}

export const CheckinActions = () => {
  const [selected, setSelected] = useState<HealthState>('good')

  return (
    <SectionCard tone="warm">
      <SectionHeader
        eyebrow="Сигнал состояния"
        title="Как вы себя чувствуете?"
        description="Один экран, одно действие: нажмите большую кнопку, и близкие увидят ваш статус."
      />
      <div className="button-stack">
        {Object.entries(labels).map(([key, label]) => (
          <ActionButton
            key={key}
            className="senior-cta"
            tone={selected === key ? 'primary' : 'secondary'}
            onClick={() => setSelected(key as HealthState)}
          >
            {label}
          </ActionButton>
        ))}
      </div>
      <div className="inline-feedback" aria-live="polite">
        <span>Текущий статус:</span>
        <Pill tone={tones[selected]}>{labels[selected]}</Pill>
      </div>
    </SectionCard>
  )
}
