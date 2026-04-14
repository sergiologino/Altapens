'use client'

import { LightboxImage } from '@/components/LightboxImage'
import styles from '@/app/landing.module.css'

type Item = {
  src: string
  alt: string
  caption: string
}

type Props = {
  items: Item[]
}

export function ArticleIllustrations({ items }: Props) {
  return (
    <div className={styles.articleFigures}>
      {items.map((item) => (
        <figure key={item.src} className={styles.articleFigure}>
          <div className={styles.articleFigureFrame}>
            <LightboxImage
              src={item.src}
              alt={item.alt}
              width={960}
              height={600}
              sizes="(max-width: 720px) 100vw, 340px"
              className={styles.articleFigureImg}
            />
          </div>
          <figcaption className={styles.articleFigureCaption}>
            {item.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
