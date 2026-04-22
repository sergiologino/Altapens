let compatModuleLoaded = false

/**
 * Второй «модуль» (чанк) стилей для плотной/legacy вёрстки — как в играх: грузим после детекции.
 */
export async function loadCompatStylesIfNeeded(tier: 'standard' | 'compact' | 'cozy', legacy: boolean) {
  if (compatModuleLoaded) {
    return
  }
  if (tier === 'standard' && !legacy) {
    return
  }
  compatModuleLoaded = true
  await import('./compat-overrides.css')
}
