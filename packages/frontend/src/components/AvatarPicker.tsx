import { AVATARS } from '../lib/avatars'
import styles from './AvatarPicker.module.css'

interface Props {
  value: string
  onChange: (avatarId: string) => void
}

export function AvatarPicker({ value, onChange }: Props) {
  return (
    <div className={styles.grid} role="group" aria-label="Choose an avatar">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          className={`${styles.avatarBtn}${value === avatar.id ? ` ${styles.selected}` : ''}`}
          onClick={() => onChange(avatar.id)}
          aria-label={avatar.label}
          aria-pressed={value === avatar.id}
        >
          {avatar.emoji}
          <span className={styles.tooltip}>{avatar.label}</span>
        </button>
      ))}
    </div>
  )
}
