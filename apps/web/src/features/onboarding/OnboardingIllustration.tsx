import type { OnboardingSlide } from '@/features/onboarding/onboarding-content'

type Props = {
  art: OnboardingSlide['art']
  accent?: OnboardingSlide['accent']
}

const stroke = 'rgba(76, 74, 102, 0.35)'
const fillSoft = 'rgba(124, 92, 255, 0.12)'
const fillTeal = 'rgba(45, 127, 131, 0.15)'
const fillWarm = 'rgba(232, 180, 160, 0.35)'
const accentHeart = '#c53030'

export function OnboardingIllustration({ art }: Props) {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 220 100',
    className: 'onboarding-slide-art-svg',
    'aria-hidden': true as const,
  }

  switch (art) {
    case 'care':
      return (
        <svg {...common}>
          <ellipse cx="110" cy="88" rx="88" ry="8" fill="rgba(76,74,102,0.06)" />
          <path
            d="M110 22c-8 12-22 20-22 32 0 14 10 22 22 22s22-8 22-22c0-12-14-20-22-32z"
            fill={fillWarm}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <circle cx="78" cy="48" r="14" fill={fillSoft} stroke={stroke} strokeWidth="1.2" />
          <circle cx="142" cy="48" r="14" fill={fillTeal} stroke={stroke} strokeWidth="1.2" />
          <path
            d="M92 62c8 10 28 10 36 0"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'modes':
      return (
        <svg {...common}>
          <rect x="24" y="20" width="72" height="56" rx="10" fill={fillSoft} stroke={stroke} strokeWidth="1.2" />
          <circle cx="48" cy="42" r="6" fill="rgba(124,92,255,0.35)" />
          <rect x="58" y="38" width="28" height="8" rx="2" fill="rgba(124,92,255,0.2)" />
          <rect x="38" y="56" width="44" height="10" rx="3" fill="rgba(255,255,255,0.7)" stroke={stroke} strokeWidth="0.8" />
          <rect x="124" y="20" width="72" height="56" rx="10" fill={fillTeal} stroke={stroke} strokeWidth="1.2" />
          <rect x="138" y="34" width="44" height="6" rx="2" fill="rgba(45,127,131,0.25)" />
          <rect x="138" y="46" width="36" height="6" rx="2" fill="rgba(45,127,131,0.2)" />
          <rect x="138" y="58" width="40" height="6" rx="2" fill="rgba(45,127,131,0.15)" />
        </svg>
      )
    case 'safety':
      return (
        <svg {...common}>
          <path
            d="M110 18 L168 38 V58c0 22-24 40-58 48-34-8-58-26-58-48V38z"
            fill={fillTeal}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d="M110 32 L154 48 V58c0 16-18 30-44 36-26-6-44-20-44-36V48z"
            fill="rgba(255,255,255,0.55)"
            stroke="rgba(45,127,131,0.4)"
            strokeWidth="1"
          />
          <path
            d="M96 52 L104 62 L128 38"
            fill="none"
            stroke="#2d7f83"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="52" y="68" width="36" height="28" rx="4" fill={fillWarm} stroke={stroke} strokeWidth="1" />
          <path d="M58 76h24M58 82h18" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M152 70h20c4 0 8 4 8 8v12h-36V78c0-4 4-8 8-8z"
            fill="rgba(255,255,255,0.85)"
            stroke={stroke}
            strokeWidth="1"
          />
        </svg>
      )
    case 'invite':
      return (
        <svg {...common}>
          <ellipse cx="110" cy="88" rx="88" ry="8" fill="rgba(76,74,102,0.06)" />
          <circle cx="110" cy="44" r="28" fill={fillSoft} stroke={stroke} strokeWidth="1.2" />
          <path
            d="M98 44c0-6 5-11 12-11s12 5 12 11-5 14-12 20c-7-6-12-14-12-20z"
            fill={accentHeart}
            opacity="0.85"
          />
          <rect x="72" y="72" width="76" height="20" rx="6" fill="rgba(255,255,255,0.9)" stroke={stroke} strokeWidth="1.2" />
          <path
            d="M86 82h48M102 76v12"
            stroke="rgba(124,92,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'family':
      return (
        <svg {...common}>
          <circle cx="56" cy="46" r="16" fill={fillTeal} stroke={stroke} strokeWidth="1.2" />
          <circle cx="110" cy="40" r="18" fill={fillSoft} stroke={stroke} strokeWidth="1.2" />
          <circle cx="164" cy="46" r="16" fill={fillWarm} stroke={stroke} strokeWidth="1.2" />
          <path
            d="M40 72 Q56 62 72 72"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d="M94 68 Q110 58 126 68"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d="M148 72 Q164 62 180 72"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
          <circle cx="110" cy="88" r="4" fill="rgba(124,92,255,0.4)" />
          <circle cx="92" cy="84" r="3" fill="rgba(45,127,131,0.35)" />
          <circle cx="128" cy="84" r="3" fill="rgba(45,127,131,0.35)" />
        </svg>
      )
    case 'start':
      return (
        <svg {...common}>
          <circle cx="110" cy="48" r="32" fill={fillSoft} stroke={stroke} strokeWidth="1.2" />
          <path
            d="M98 48 L106 56 L124 36"
            fill="none"
            stroke="#7c5cff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M62 28l6 4-6 4M152 28l-6 4 6 4M110 12v8"
            stroke="rgba(124,92,255,0.45)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="78" y="78" width="64" height="14" rx="7" fill="rgba(255,255,255,0.85)" stroke={stroke} strokeWidth="1" />
        </svg>
      )
    default:
      return null
  }
}
