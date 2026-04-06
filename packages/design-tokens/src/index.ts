const cssEntries = (entries: Record<string, string | number>) =>
  Object.entries(entries)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n')

export const colorTokens = {
  'color-bg-app': '#f5efe6',
  'color-bg-senior': '#fbf6ef',
  'color-bg-caregiver': '#f2f1f8',
  'color-surface-base': '#fffaf4',
  'color-surface-elevated': '#ffffff',
  'color-surface-quiet': '#f4ebdf',
  'color-content-primary': '#1f2333',
  'color-content-secondary': '#5d6478',
  'color-content-soft': '#7d8090',
  'color-border-soft': 'rgba(76, 74, 102, 0.12)',
  'color-border-strong': 'rgba(59, 56, 81, 0.2)',
  'color-accent-primary': '#7c5cff',
  'color-accent-secondary': '#2d7f83',
  'color-accent-warm': '#d98d54',
  'color-success-soft': '#d8eadf',
  'color-success-strong': '#2d6f56',
  'color-warning-soft': '#f7e1c8',
  'color-warning-strong': '#9b5b18',
  'color-danger-soft': '#f8d8d4',
  'color-danger-strong': '#a2474b',
  'color-focus-ring': 'rgba(124, 92, 255, 0.34)',
} as const

export const typographyTokens = {
  'font-display': '"Fraunces", serif',
  'font-body': '"Manrope", sans-serif',
  'font-size-xs': '0.8125rem',
  'font-size-sm': '0.9375rem',
  'font-size-md': '1rem',
  'font-size-lg': '1.125rem',
  'font-size-xl': '1.375rem',
  'font-size-2xl': '1.75rem',
  'font-size-3xl': '2.375rem',
  'font-size-4xl': '3.25rem',
  'line-height-tight': '1.1',
  'line-height-snug': '1.25',
  'line-height-normal': '1.5',
  'line-height-loose': '1.65',
} as const

export const spacingTokens = {
  'space-1': '0.25rem',
  'space-2': '0.5rem',
  'space-3': '0.75rem',
  'space-4': '1rem',
  'space-5': '1.25rem',
  'space-6': '1.5rem',
  'space-7': '1.75rem',
  'space-8': '2rem',
  'space-10': '2.5rem',
  'space-12': '3rem',
  'space-16': '4rem',
} as const

export const radiusTokens = {
  'radius-sm': '0.75rem',
  'radius-md': '1rem',
  'radius-lg': '1.5rem',
  'radius-xl': '2rem',
  'radius-pill': '999px',
} as const

export const shadowTokens = {
  'shadow-soft-sm':
    '0 1px 2px rgba(36, 38, 56, 0.06), 0 10px 24px rgba(78, 64, 132, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.45)',
  'shadow-soft-md':
    '0 8px 20px rgba(31, 35, 51, 0.07), 0 20px 45px rgba(115, 88, 203, 0.08), 0 1px 0 rgba(255, 255, 255, 0.6) inset',
  'shadow-float-lg':
    '0 18px 36px rgba(31, 35, 51, 0.1), 0 30px 72px rgba(124, 92, 255, 0.12), 0 1px 0 rgba(255, 255, 255, 0.7) inset',
  'shadow-modal-xl':
    '0 28px 68px rgba(26, 26, 44, 0.22), 0 40px 120px rgba(74, 51, 153, 0.16), 0 1px 0 rgba(255, 255, 255, 0.85) inset',
} as const

export const motionTokens = {
  'motion-fast': '140ms',
  'motion-normal': '220ms',
  'motion-slow': '320ms',
  'motion-entrance-y': 'translateY(10px)',
  'motion-hover-lift': 'translateY(-3px)',
  'motion-press-scale': 'scale(0.98)',
} as const

export const layerTokens = {
  'layer-background': '0',
  'layer-base': '1',
  'layer-raised': '5',
  'layer-floating': '10',
  'layer-sticky': '20',
  'layer-drawer': '30',
  'layer-modal': '40',
  'layer-toast': '50',
} as const

export const allTokens = {
  ...colorTokens,
  ...typographyTokens,
  ...spacingTokens,
  ...radiusTokens,
  ...shadowTokens,
  ...motionTokens,
  ...layerTokens,
} as const

export const getThemeStyleText = () => `:root {\n${cssEntries(allTokens)}\n}`
