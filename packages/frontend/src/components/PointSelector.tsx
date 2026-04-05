import type { PointValue } from '../hooks/useWebSocket'
import styles from './PointSelector.module.css'

const POINTS: PointValue[] = [0, 1, 2, 3, 5, 8, 13, 21, '?']

interface Props {
  value: PointValue | null
  onChange: (points: PointValue | null) => void
  disabled?: boolean
}

export function PointSelector({ value, onChange, disabled }: Props) {
  return (
    <div className={styles.grid} role="group" aria-label="Select your estimate">
      {POINTS.map((point) => (
        <button
          key={point}
          type="button"
          className={`${styles.card}${value === point ? ` ${styles.selected}` : ''}`}
          onClick={() => onChange(value === point ? null : point)}
          disabled={disabled}
          aria-pressed={value === point}
        >
          {point}
        </button>
      ))}
    </div>
  )
}
