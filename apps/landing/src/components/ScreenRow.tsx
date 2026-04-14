import type { ReactNode } from 'react'
import styles from '@/app/landing.module.css'

type Props = {
  children: ReactNode
  reverse?: boolean
}

export function ScreenRow({ children, reverse }: Props) {
  return (
    <div
      className={
        reverse
          ? `${styles.screenRow} ${styles.screenRowReverse}`
          : styles.screenRow
      }
    >
      {children}
    </div>
  )
}
