import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Check, Copy, Settings } from 'lucide-react'
import { RoomProvider, useRoom } from '../context/RoomContext'
import { ParticipantCard } from '../components/ParticipantCard'
import { PointSelector } from '../components/PointSelector'
import { FireworksOverlay } from '../components/FireworksOverlay'
import { ProfileModal } from '../components/ProfileModal'
import { useLocalUser } from '../hooks/useLocalUser'
import styles from './Room.module.css'

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <span className={styles.copyWrapper}>
      <button
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="Copy room link"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {copied && <span className={styles.copyConfirm}>Room URL copied!</span>}
    </span>
  )
}

function RoomView({ roomId }: { roomId: string }) {
  const {
    participants,
    revealedParticipants,
    revealed,
    allMatch,
    myVote,
    status,
    sendVote,
    sendReveal,
    sendReset,
    updateProfile,
  } = useRoom()
  const { user, setUser } = useLocalUser()
  const [showProfile, setShowProfile] = useState(false)

  const displayParticipants = revealed && revealedParticipants ? revealedParticipants : participants
  const anyVotes = participants.some((p) => p.hasVoted)

  function handleSaveProfile(name: string, avatar: string) {
    setUser(name, avatar)
    updateProfile(name, avatar)
  }

  return (
    <div className={styles.page}>
      <FireworksOverlay active={allMatch} />

      {showProfile && user && (
        <ProfileModal
          initialName={user.name}
          initialAvatar={user.avatar}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      <header className={styles.header}>
        <div className={styles.roomId}>
          <span className={styles.roomIdLabel}>Room</span>
          {roomId}
          <CopyButton url={`${window.location.origin}/room/${roomId}`} />
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.status} ${styles[status]}`}>
            {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
          </span>
          <button
            className={styles.gearBtn}
            onClick={() => setShowProfile(true)}
            aria-label="Edit profile"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          {!revealed && (
            <button
              className={styles.btnPrimary}
              onClick={sendReveal}
              disabled={!anyVotes}
            >
              Reveal Cards
            </button>
          )}
          {revealed && (
            <button className={styles.btnSecondary} onClick={sendReset}>
              New Round
            </button>
          )}
        </div>

        <section className={styles.participantsSection}>
          {displayParticipants.length === 0 ? (
            <p className={styles.emptyState}>Waiting for others to join…</p>
          ) : (
            <div className={styles.participants}>
              {displayParticipants.map((p) => (
                <ParticipantCard key={p.userId} participant={p} revealed={revealed} />
              ))}
            </div>
          )}
        </section>

        {!revealed && (
          <section className={styles.votingSection}>
            <PointSelector value={myVote} onChange={sendVote} />
          </section>
        )}
      </main>
    </div>
  )
}

export function Room() {
  const { id: roomId } = useParams<{ id: string }>()
  const { user } = useLocalUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate(`/?room=${roomId}`, { replace: true })
    }
  }, [user, navigate, roomId])

  if (!user || !roomId) {
    return <div className={styles.redirect}>Redirecting…</div>
  }

  return (
    <RoomProvider
      roomId={roomId}
      userId={user.userId}
      name={user.name}
      avatar={user.avatar}
    >
      <RoomView roomId={roomId} />
    </RoomProvider>
  )
}
