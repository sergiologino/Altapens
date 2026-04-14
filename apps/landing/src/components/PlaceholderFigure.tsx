import { LightboxImage } from '@/components/LightboxImage'
import styles from '@/app/landing.module.css'

type Props = {
  src: string
  alt: string
  caption: string
  body: string
  priority?: boolean
}

export function PlaceholderFigure({
  src,
  alt,
  caption,
  body,
  priority,
}: Props) {
  return (
    <figure className={styles.screenFigure}>
      <div className={styles.screenFrame}>
        <LightboxImage
          src={src}
          alt={alt}
          width={960}
          height={600}
          className={styles.screenImg}
          sizes="(max-width: 900px) 100vw, 45vw"
          priority={priority}
        />
      </div>
      <figcaption>
        <strong className={styles.screenCaption}>{caption}</strong>
        <p className={styles.screenBody}>{body}</p>
        <p className={styles.screenNote}>
          Иллюстрация-заглушка: позже сюда подставится настоящий снимок экрана из
          приложения.
        </p>
      </figcaption>
    </figure>
  )
}
