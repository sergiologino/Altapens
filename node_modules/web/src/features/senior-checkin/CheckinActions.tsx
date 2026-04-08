import { useState } from 'react'
import { useAuthStore } from '@/app/store/auth-store'
import { useBackendApi } from '@/shared/api/api-base'
import { useRecordWellbeingCheckinMutation } from '@/shared/api/care-client'
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
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi
  const mutation = useRecordWellbeingCheckinMutation()

  const sendCheckin = (state: HealthState) => {
    setSelected(state)
    if (!useHttp || session?.role !== 'senior') {
      return
    }
    mutation.mutate({ state })
  }

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
            onClick={() => sendCheckin(key as HealthState)}
            disabled={Boolean(useHttp && session?.role === 'senior' && mutation.isPending)}
          >
            {label}
          </ActionButton>
        ))}
      </div>
      <div className="inline-feedback" aria-live="polite">
        <span>Текущий статус:</span>
        <Pill tone={tones[selected]}>{labels[selected]}</Pill>
      </div>
      {useHttp && session?.role === 'senior' && mutation.isError ? (
        <p role="status">Не удалось отправить. Проверьте связь и попробуйте снова.</p>
      ) : null}
    </SectionCard>
  )
}
