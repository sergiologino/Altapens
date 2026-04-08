export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
}

export function createSpeechRecognition(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
  if (!Ctor) return null
  const r = new Ctor()
  r.lang = 'ru-RU'
  r.continuous = false
  r.interimResults = true
  r.maxAlternatives = 1
  return r
}

export type RecognitionHandlers = {
  onInterim?: (text: string) => void
  onFinal: (text: string) => void
  onError?: (code: string) => void
}

/** Одна сессия «нажал — говорю — отпустил»; вызывать `stop()` при отпускании. */
export function runSpeechSession(handlers: RecognitionHandlers): {
  recognition: SpeechRecognition
  stop: () => void
} | null {
  const recognition = createSpeechRecognition()
  if (!recognition) return null

  const stop = () => {
    try {
      recognition.stop()
    } catch {
      /* already stopped */
    }
  }

  recognition.onresult = (ev: SpeechRecognitionEvent) => {
    let interim = ''
    let final = ''
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const res = ev.results[i]
      const t = res[0]?.transcript?.trim() ?? ''
      if (res.isFinal) {
        final += t
      } else {
        interim += t
      }
    }
    if (interim && handlers.onInterim) {
      handlers.onInterim(interim)
    }
    if (final) {
      handlers.onFinal(final.trim())
    }
  }

  recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
    handlers.onError?.(ev.error)
  }

  try {
    recognition.start()
  } catch {
    handlers.onError?.('start-failed')
    return null
  }

  return { recognition, stop }
}
