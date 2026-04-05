import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { nanoid } from 'nanoid'
import { AvatarPicker } from '../components/AvatarPicker'
import { useLocalUser } from '../hooks/useLocalUser'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const { user, setUser } = useLocalUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnRoom = searchParams.get('room')

  const [name, setName] = useState(user?.name ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? 'ninja')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setUser(trimmed, avatar)
    navigate(`/room/${returnRoom ?? nanoid(8)}`)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Scrum Poker</h1>
          <p className={styles.subtitle}>Estimate together, ship with confidence.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="e.g. Lawangin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.label}>Pick an avatar</span>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          <button className={styles.submit} type="submit" disabled={!name.trim()}>
            Create Room
          </button>
        </form>
      </div>
    </main>
  )
}
