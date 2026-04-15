import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReminderPrefsState {
  browserMedicationReminders: boolean
  setBrowserMedicationReminders: (value: boolean) => void
}

export const useReminderPrefsStore = create<ReminderPrefsState>()(
  persist(
    (set) => ({
      browserMedicationReminders: false,
      setBrowserMedicationReminders: (browserMedicationReminders) => set({ browserMedicationReminders }),
    }),
    { name: 'altapens-reminder-prefs' },
  ),
)
