import type { MedicationDose } from '@altapens/shared-types'
import { useEffect, useMemo, useRef } from 'react'

import { calendarDayKey, shouldNotifyMedicationDose } from '@/features/medication-reminders/medication-reminder-logic'

const STORAGE_PREFIX = 'altapens:med-notify:'

function readNotifiedSet(dayKey: string): Set<string> {
  if (typeof sessionStorage === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + dayKey)
    const arr: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function persistNotifiedSet(dayKey: string, ids: Set<string>) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_PREFIX + dayKey, JSON.stringify([...ids]))
  } catch {
    /* quota / private mode */
  }
}

function showNotification(dose: MedicationDose) {
  const title = 'Пора принять лекарство'
  const body = `${dose.title} — ${dose.plannedTime}${dose.dosageText ? `. ${dose.dosageText}` : ''}`
  try {
    const n = new Notification(title, {
      body,
      tag: `altapens-med-${dose.id}-${calendarDayKey(new Date())}`,
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* Notification ctor failed */
  }
}

/**
 * Локальные напоминания по расписанию слотов (браузерные уведомления).
 * Работает при открытом приложении; push в фоне — отдельная цепочка (см. docs/push-notifications.md).
 */
export function useMedicationBrowserReminders(medications: MedicationDose[] | undefined, enabled: boolean) {
  const medsKey = useMemo(
    () =>
      medications
        ? medications.map((d) => `${d.id}:${d.plannedTime}:${d.status}`).join('|')
        : '',
    [medications],
  )
  const medsRef = useRef<MedicationDose[] | undefined>(medications)

  useEffect(() => {
    medsRef.current = medications
  }, [medications])

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    const tick = () => {
      const list = medsRef.current
      if (!list?.length) return
      const now = new Date()
      const dayKey = calendarDayKey(now)
      const notified = readNotifiedSet(dayKey)

      for (const dose of list) {
        if (!shouldNotifyMedicationDose(dose, now, notified)) continue
        showNotification(dose)
        notified.add(dose.id)
        persistNotifiedSet(dayKey, notified)
      }
    }

    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [enabled, medsKey])
}
