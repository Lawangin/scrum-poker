import { getEmoji } from '../lib/avatars'
import type { ParticipantPublic, ParticipantRevealed } from '../hooks/useWebSocket'
import styles from './ParticipantCard.module.css'

interface Props {
  participant: ParticipantPublic | ParticipantRevealed
  revealed: boolean
}

function isRevealed(p: ParticipantPublic | ParticipantRevealed): p is ParticipantRevealed {
  return 'points' in p
}

export function ParticipantCard({ participant, revealed }: Props) {
  const points = revealed && isRevealed(participant) ? participant.points : undefined

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card}${revealed ? ` ${styles.revealed}` : ''}`}>
        {/* Front — avatar + name + voted indicator */}
        <div
          className={`${styles.face} ${styles.front}${!participant.hasVoted ? ` ${styles.waiting}` : ''}`}
        >
          <span className={styles.avatar}>{getEmoji(participant.avatar)}</span>
          <span className={styles.name}>{participant.name}</span>
          {participant.hasVoted && <span className={styles.votedDot} aria-label="Voted" />}
        </div>

        {/* Back — points */}
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.points}>{points ?? '?'}</span>
        </div>
      </div>
    </div>
  )
}
