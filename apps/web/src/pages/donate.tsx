import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createDonationRequestSchema } from '@altapens/api-contracts'
import { ActionButton, SectionCard, SectionHeader } from '@/shared/ui/primitives'
import {
  createDonation,
  getDonationStatus,
  isDonationsApiAvailable,
} from '@/shared/api/payments-client'

const formSchema = z.object({
  amountRub: z
    .number({ error: 'Введите сумму' })
    .int('Целое число рублей')
    .min(100, 'Минимум 100 ₽')
    .max(1_000_000, 'Слишком большая сумма'),
})

export const DonatePage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const apiOk = isDonationsApiAvailable()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amountRub: 100 },
  })

  return (
    <div className="portal-page donate-page">
      <div className="donate-page-header">
        <button type="button" className="donate-back-link" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <Link to="/start" className="donate-back-link">
          На главный экран
        </Link>
      </div>
      <SectionCard>
        <SectionHeader
          eyebrow="Поддержка AltaPens"
          title="Пожертвование"
          description="Любая сумма помогает развивать приложение для пожилых людей и их близких. Минимум 100 ₽. Оплата через ЮKassa."
        />
        {!apiOk ? (
          <p className="field-error donate-hint" role="alert">
            Для оплаты нужен доступ к серверу API. Укажите в окружении VITE_API_BASE_URL (или same-origin) и
            перезапустите приложение.
          </p>
        ) : null}
        <form
          className="form-grid"
          onSubmit={form.handleSubmit(async (values) => {
            setError('')
            setLoading(true)
            try {
              const parsed = createDonationRequestSchema.parse({ amountRub: values.amountRub })
              const res = await createDonation(parsed)
              window.location.assign(res.confirmationUrl)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Не удалось создать платёж')
            } finally {
              setLoading(false)
            }
          })}
        >
          <label className="field-group">
            <span className="field-label">Сумма, ₽</span>
            <input
              className="text-input"
              type="number"
              inputMode="numeric"
              min={100}
              step={1}
              {...form.register('amountRub', { valueAsNumber: true })}
            />
            {form.formState.errors.amountRub ? (
              <span className="field-error">{form.formState.errors.amountRub.message}</span>
            ) : null}
          </label>
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
          <ActionButton type="submit" disabled={!apiOk || loading}>
            {loading ? 'Переход к оплате…' : 'Перейти к оплате'}
          </ActionButton>
        </form>
      </SectionCard>
    </div>
  )
}

export const DonateReturnPage = () => {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const donationId = params.get('donationId')
  const demo = params.get('demo') === '1'

  const [status, setStatus] = useState<'loading' | 'ok' | 'pending' | 'fail' | 'canceled'>(() =>
    !donationId || !isDonationsApiAvailable() ? 'fail' : 'loading',
  )
  const [amountRub, setAmountRub] = useState<number | null>(null)

  useEffect(() => {
    if (!donationId || !isDonationsApiAvailable()) {
      return
    }
    let cancelled = false
    const poll = async () => {
      try {
        const res = await getDonationStatus(donationId)
        if (cancelled) return
        setAmountRub(res.amountRub)
        if (res.status === 'succeeded') setStatus('ok')
        else if (res.status === 'canceled') setStatus('canceled')
        else setStatus('pending')
      } catch {
        if (!cancelled) setStatus('fail')
      }
    }
    void poll()
    if (demo) return
    const t = window.setInterval(poll, 2500)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [donationId, demo])

  if (!donationId) {
    return (
      <div className="portal-page donate-page">
        <div className="donate-page-header">
          <button type="button" className="donate-back-link" onClick={() => navigate(-1)}>
            ← Назад
          </button>
          <Link to="/start" className="donate-back-link">
            На главный экран
          </Link>
        </div>
        <SectionCard>
          <p>Не указан платёж. Вернитесь на страницу пожертвования.</p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="portal-page donate-page">
      <div className="donate-page-header">
        <button type="button" className="donate-back-link" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <Link to="/start" className="donate-back-link">
          На главный экран
        </Link>
      </div>
      <SectionCard>
        <SectionHeader
          eyebrow="Оплата"
          title={
            status === 'loading'
              ? 'Проверяем платёж…'
              : status === 'ok'
                ? 'Спасибо!'
                : status === 'canceled'
                  ? 'Платёж отменён'
                  : status === 'pending'
                    ? 'Ожидаем подтверждение'
                    : 'Не удалось проверить'
          }
          description={
            status === 'ok' && amountRub != null
              ? `Ваше пожертвование ${amountRub} ₽ получено. Благодарим за поддержку AltaPens.`
              : status === 'pending'
                ? 'Банк ещё обрабатывает оплату. Страница обновится автоматически.'
                : status === 'canceled'
                  ? 'Если это ошибка, попробуйте ещё раз со страницы пожертвования.'
                  : status === 'fail'
                    ? 'Проверьте подключение к серверу или откройте приложение позже.'
                    : undefined
          }
        />
      </SectionCard>
    </div>
  )
}
