import { useState } from 'react'
import { X } from 'lucide-react'
import { AvatarPicker } from './AvatarPicker'
import styles from './ProfileModal.module.css'

interface Props {
  initialName: string
  initialAvatar: string
  onSave: (name: string, avatar: string) => void
  onClose: () => void
}

export function ProfileModal({ initialName, initialAvatar, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed, avatar)
    onClose()
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Edit profile">
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="profile-name">
              Your name
            </label>
            <input
              id="profile-name"
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.label}>Avatar</span>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          <button className={styles.save} type="submit" disabled={!name.trim()}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
