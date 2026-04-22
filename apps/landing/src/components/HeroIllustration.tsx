'use client'

import { LightboxImage } from '@/components/LightboxImage'
import styles from '@/app/landing.module.css'

type Props = {
  alt: string
}

export function HeroIllustration({ alt }: Props) {
  return (
    <figure className={styles.heroFigure}>
      <LightboxImage
        src="/landing_picture.webp"
        alt={alt}
        width={1200}
        height={800}
        className={styles.heroImg}
        sizes="(max-width: 960px) 100vw, 52vw"
        priority
      />
      <figcaption className={styles.srOnly}>
        Иллюстрация продукта: удобный интерфейс и связь с близкими.
      </figcaption>
    </figure>
  )
}
