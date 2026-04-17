type Props = {
  /** Размер значка в px */
  size?: number
  className?: string
}

/** Логотип: сердце в ладонях (тот же файл, что favicon / brand-logo.svg). */
export function BrandLogo({ size = 40, className }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand-logo.svg`}
      width={size}
      height={size}
      alt=""
      className={className}
      decoding="async"
    />
  )
}
