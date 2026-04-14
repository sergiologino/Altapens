'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import styles from '@/app/landing.module.css'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  sizes: string
  priority?: boolean
}

export function LightboxImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const titleId = useId()

  useEffect(() => {
    // Портал в document.body — только на клиенте (нет document при SSR)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- синхронизация с DOM для createPortal
    setMounted(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const modal =
    open && mounted ? (
      <div
        className={styles.lightboxBackdrop}
        role="presentation"
        onClick={close}
      >
        <div
          className={styles.lightboxDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => e.stopPropagation()}
        >
          <p id={titleId} className={styles.srOnly}>
            {alt}. Нажмите вне картинки или Escape, чтобы закрыть.
          </p>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={close}
            aria-label="Закрыть просмотр"
          >
            ×
          </button>
          <div className={styles.lightboxImgWrap}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={styles.lightboxFullImg}
              sizes="min(96vw, 1400px)"
              priority={open}
            />
          </div>
        </div>
      </div>
    ) : null

  return (
    <>
      <button
        type="button"
        className={styles.lightboxTrigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Открыть иллюстрацию во весь экран: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          sizes={sizes}
          priority={priority}
        />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  )
}
