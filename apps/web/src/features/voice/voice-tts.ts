function pickRuVoice(): SpeechSynthesisVoice | null {
  const list = window.speechSynthesis.getVoices()
  const ru =
    list.find((v) => v.lang?.toLowerCase().startsWith('ru')) ??
    list.find((v) => v.lang?.toLowerCase().includes('ru'))
  return ru ?? null
}

let voicesReady = false

/** Дождаться списка голосов Chrome (часто срабатывает асинхронно). */
export function ensureVoicesLoaded(): Promise<void> {
  if (voicesReady || window.speechSynthesis.getVoices().length > 0) {
    voicesReady = true
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const onVoices = () => {
      voicesReady = true
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
      resolve()
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoices)
    window.setTimeout(onVoices, 800)
  })
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel()
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number }): Promise<void> {
  if (!isSpeechSynthesisSupported() || !text.trim()) {
    return
  }

  stopSpeaking()
  await ensureVoicesLoaded()

  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text.trim())
    u.lang = 'ru-RU'
    const voice = pickRuVoice()
    if (voice) {
      u.voice = voice
    }
    u.rate = opts?.rate ?? 0.95
    u.pitch = opts?.pitch ?? 1
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}
