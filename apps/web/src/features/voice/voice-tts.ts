import { useAuthStore } from '@/app/store/auth-store'
import { useBackendApi } from '@/shared/api/api-base'
import { postNeuralSpeech } from '@/shared/api/care-client'

function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = `${v.name} ${v.lang}`.toLowerCase()
  let s = 0
  if (n.includes('natural')) s += 6
  if (n.includes('neural')) s += 6
  if (n.includes('google')) s += 5
  if (n.includes('microsoft')) s += 4
  if (n.includes('premium')) s += 3
  if (n.includes('online')) s += 2
  if (v.lang?.toLowerCase().startsWith('ru')) s += 3
  if (n.includes('ru')) s += 1
  return s
}

function pickRuVoice(): SpeechSynthesisVoice | null {
  const list = window.speechSynthesis.getVoices()
  const ru = list.filter((v) => {
    const lang = v.lang?.toLowerCase() ?? ''
    return lang.startsWith('ru') || lang.includes('ru')
  })
  if (ru.length === 0) {
    return (
      list.find((v) => v.lang?.toLowerCase().includes('ru')) ??
      list.find((v) => v.default) ??
      null
    )
  }
  return ru.reduce((best, v) => (scoreVoice(v) > scoreVoice(best) ? v : best))
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

/** Универсальное воспроизведение бинарного аудио из base64. */
export function playAudioBase64(base64: string, mimeType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      resolve()
      return
    }
    const trimmed = base64.trim()
    if (!trimmed) {
      resolve()
      return
    }
    let binary: string
    try {
      binary = atob(trimmed)
    } catch {
      reject(new Error('Invalid base64 audio'))
      return
    }
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Audio playback failed'))
    }
    void audio.play().then(undefined, reject)
  })
}

/** @deprecated используйте {@link playAudioBase64} с audio/wav */
export function playWavBase64(base64: string): Promise<void> {
  return playAudioBase64(base64, 'audio/wav')
}

async function tryOpenAiNeuralTts(text: string): Promise<boolean> {
  if (import.meta.env.VITE_NEURAL_TTS !== 'true') {
    return false
  }
  if (!useBackendApi) {
    return false
  }
  const token = useAuthStore.getState().accessToken
  if (!token) {
    return false
  }
  try {
    const { audioBase64, mimeType } = await postNeuralSpeech(text.trim())
    await playAudioBase64(audioBase64, mimeType)
    return true
  } catch {
    return false
  }
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number }): Promise<void> {
  if (!isSpeechSynthesisSupported() || !text.trim()) {
    return
  }

  const trimmed = text.trim()
  if (await tryOpenAiNeuralTts(trimmed)) {
    return
  }

  stopSpeaking()
  await ensureVoicesLoaded()

  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(trimmed)
    u.lang = 'ru-RU'
    const voice = pickRuVoice()
    if (voice) {
      u.voice = voice
    }
    u.rate = opts?.rate ?? 0.92
    u.pitch = opts?.pitch ?? 1.02
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}
