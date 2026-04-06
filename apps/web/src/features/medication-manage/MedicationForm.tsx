import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { MedicationFormValues } from '@altapens/shared-types'
import { ActionButton, SectionCard, SectionHeader } from '@/shared/ui/primitives'

const medicationSchema = z.object({
  title: z.string().min(2, 'Укажите название лекарства'),
  dosageText: z.string().min(2, 'Добавьте дозировку'),
  instructions: z.string().min(6, 'Нужна короткая инструкция'),
  exactTimes: z.string().min(4, 'Добавьте время, например 09:00, 20:00'),
  daysOfWeek: z.string().min(2, 'Укажите частоту, например Ежедневно'),
  confirmationRequired: z.boolean(),
  notifyOnMissed: z.boolean(),
})

const defaultValues: MedicationFormValues = {
  title: 'Магний B6',
  dosageText: '1 таблетка',
  instructions: 'После еды, запить водой.',
  exactTimes: '09:00, 14:00',
  daysOfWeek: 'Ежедневно',
  confirmationRequired: true,
  notifyOnMissed: true,
}

export const MedicationForm = () => {
  const [savedMessage, setSavedMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues,
  })

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Лекарства"
        title="Настроить напоминание"
        description="Название, время приёма, нужно ли подтверждение от подопечного и сообщать ли вам о пропусках."
      />
      <form
        className="form-grid"
        onSubmit={handleSubmit(async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 250))
          setSavedMessage(
            `Курс "${values.title}" сохранён. Напоминания: ${values.exactTimes}. Подтверждение ${
              values.confirmationRequired ? 'включено' : 'отключено'
            }.`,
          )
        })}
      >
        <label className="field-group">
          <span className="field-label">Название</span>
          <input className="text-input" {...register('title')} />
          {errors.title ? <span className="field-error">{errors.title.message}</span> : null}
        </label>
        <label className="field-group">
          <span className="field-label">Дозировка</span>
          <input className="text-input" {...register('dosageText')} />
          {errors.dosageText ? (
            <span className="field-error">{errors.dosageText.message}</span>
          ) : null}
        </label>
        <label className="field-group field-span-2">
          <span className="field-label">Инструкция</span>
          <textarea className="text-input text-area" rows={3} {...register('instructions')} />
          {errors.instructions ? (
            <span className="field-error">{errors.instructions.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Точное время</span>
          <input className="text-input" {...register('exactTimes')} />
          {errors.exactTimes ? (
            <span className="field-error">{errors.exactTimes.message}</span>
          ) : null}
        </label>
        <label className="field-group">
          <span className="field-label">Частота</span>
          <input className="text-input" {...register('daysOfWeek')} />
          {errors.daysOfWeek ? (
            <span className="field-error">{errors.daysOfWeek.message}</span>
          ) : null}
        </label>
        <label className="toggle-row field-span-2">
          <input type="checkbox" {...register('confirmationRequired')} />
          <span>Спрашивать подопечного, принял ли он лекарство</span>
        </label>
        <label className="toggle-row field-span-2">
          <input type="checkbox" {...register('notifyOnMissed')} />
          <span>Уведомлять родственника о систематических пропусках</span>
        </label>
        <div className="button-row field-span-2">
          <ActionButton type="submit">{isSubmitting ? 'Сохраняем...' : 'Сохранить курс'}</ActionButton>
          <ActionButton type="button" tone="secondary">
            Выключить подтверждение
          </ActionButton>
        </div>
        {savedMessage ? (
          <div className="inline-feedback form-feedback" aria-live="polite">
            {savedMessage}
          </div>
        ) : null}
      </form>
    </SectionCard>
  )
}
