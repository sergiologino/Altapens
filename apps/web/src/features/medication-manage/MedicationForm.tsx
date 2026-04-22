import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import type { MedicationFormValues } from '@altapens/shared-types'
import { useAuthStore } from '@/app/store/auth-store'
import { useBackendApi } from '@/shared/api/api-base'
import { useCreateMedicationMutation } from '@/shared/api/care-client'
import { useCaregiverDashboardQuery } from '@/shared/api/mock-api'
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

function seniorInitials(fullName: string): string {
  const p = fullName.trim().split(/\s+/).filter(Boolean)
  if (p.length >= 2) return `${p[0][0] ?? ''}${p[1][0] ?? ''}`.toUpperCase()
  return (p[0]?.slice(0, 2) ?? '?').toUpperCase()
}

export const MedicationForm = () => {
  const [savedMessage, setSavedMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const session = useAuthStore((s) => s.session)
  const useHttp = useBackendApi
  const createMutation = useCreateMedicationMutation()
  const { data: dash } = useCaregiverDashboardQuery()
  const seniors = dash?.seniors ?? []

  const urlSeniorId = searchParams.get('seniorUserId') ?? ''
  const [pickedSeniorId, setPickedSeniorId] = useState(urlSeniorId)

  useEffect(() => {
    setPickedSeniorId(urlSeniorId)
  }, [urlSeniorId])

  useEffect(() => {
    if (session?.role !== 'caregiver') return
    if (seniors.length !== 1) return
    if (urlSeniorId || pickedSeniorId) return
    const only = seniors[0].id
    setPickedSeniorId(only)
    setSearchParams(
      (next) => {
        next.set('seniorUserId', only)
        return next
      },
      { replace: true },
    )
  }, [session?.role, seniors, urlSeniorId, pickedSeniorId, setSearchParams])

  const effectiveSeniorId = pickedSeniorId || urlSeniorId
  const caregiverMustPick = session?.role === 'caregiver' && seniors.length > 0 && !effectiveSeniorId
  const caregiverNoSeniors = session?.role === 'caregiver' && seniors.length === 0

  const selectSenior = (id: string) => {
    setPickedSeniorId(id)
    setSearchParams(
      (next) => {
        next.set('seniorUserId', id)
        return next
      },
      { replace: true },
    )
  }

  const selectedSeniorName =
    effectiveSeniorId && seniors.length > 0
      ? seniors.find((s) => s.id === effectiveSeniorId)?.fullName
      : undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues,
  })

  const formLocked = caregiverMustPick || caregiverNoSeniors

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Лекарства"
        title="Настроить напоминание"
        description="Название, время приёма, подтверждение от подопечного и уведомления о пропусках."
      />

      {session?.role === 'caregiver' ? (
        <div className="medication-senior-block">
          <span className="medication-senior-label">Для кого курс</span>
          {caregiverNoSeniors ? (
            <p className="medication-senior-caption">
              Сначала добавьте подопечного через приглашение в разделе{' '}
              <Link to="/caregiver/seniors">«Подопечные»</Link>.
            </p>
          ) : (
            <>
              <div className="medication-senior-picker" role="listbox" aria-label="Выбор подопечного">
                {seniors.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={effectiveSeniorId === s.id}
                    className={`medication-senior-avatar${effectiveSeniorId === s.id ? ' medication-senior-avatar-active' : ''}`}
                    title={s.fullName}
                    onClick={() => selectSenior(s.id)}
                  >
                    {seniorInitials(s.fullName)}
                  </button>
                ))}
              </div>
              {effectiveSeniorId ? (
                <p className="medication-senior-caption">
                  Выбрано: <strong>{selectedSeniorName ?? '—'}</strong>
                </p>
              ) : (
                <p className="medication-senior-caption">Нажмите на инициалы подопечного, затем заполните форму.</p>
              )}
            </>
          )}
        </div>
      ) : null}

      <form
        className="form-grid"
        onSubmit={handleSubmit(async (values) => {
          setFormError('')
          if (formLocked) {
            setFormError(
              caregiverNoSeniors
                ? 'Нет подопечных для назначения курса.'
                : 'Сначала выберите подопечного выше.',
            )
            return
          }
          if (useHttp) {
            try {
              await createMutation.mutateAsync({
                seniorUserId:
                  session?.role === 'caregiver' ? effectiveSeniorId || undefined : undefined,
                title: values.title,
                dosageText: values.dosageText,
                instructions: values.instructions,
                exactTimes: values.exactTimes,
                daysOfWeek: values.daysOfWeek,
                confirmationRequired: values.confirmationRequired,
                notifyOnMissed: values.notifyOnMissed,
              })
              setSavedMessage(
                `Курс «${values.title}» сохранён на сервере. Напоминания: ${values.exactTimes}.`,
              )
            } catch (e) {
              setFormError(e instanceof Error ? e.message : 'Не удалось сохранить')
            }
            return
          }
          await new Promise((resolve) => setTimeout(resolve, 250))
          setSavedMessage(
            `Курс "${values.title}" сохранён локально (демо). Напоминания: ${values.exactTimes}. Подтверждение ${
              values.confirmationRequired ? 'включено' : 'отключено'
            }.`,
          )
        })}
      >
        <fieldset className="medication-form-fieldset" disabled={formLocked}>
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
            <span className="field-label">Как принимать (памятка для подопечного и для вас)</span>
            <textarea
              className="text-input text-area"
              rows={3}
              {...register('instructions')}
              placeholder="Например: после еды, запить водой. Один текст видят и подопечный, и куратор."
            />
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
            <ActionButton type="submit" disabled={formLocked}>
              {isSubmitting || createMutation.isPending ? 'Сохраняем...' : 'Сохранить курс'}
            </ActionButton>
            <ActionButton type="button" tone="secondary">
              Выключить подтверждение
            </ActionButton>
          </div>
        </fieldset>
        {formError ? (
          <div className="field-error field-span-2" role="alert">
            {formError}
          </div>
        ) : null}
        {savedMessage ? (
          <div className="inline-feedback form-feedback" aria-live="polite">
            {savedMessage}
          </div>
        ) : null}
      </form>
    </SectionCard>
  )
}
