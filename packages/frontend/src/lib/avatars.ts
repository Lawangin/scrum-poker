export interface AvatarDef {
  id: string
  emoji: string
  label: string
}

export const AVATARS: AvatarDef[] = [
  { id: 'ninja',  emoji: '🥷', label: 'Ninja'  },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'fox',    emoji: '🦊', label: 'Fox'    },
  { id: 'cat',    emoji: '🐱', label: 'Cat'    },
  { id: 'bear',   emoji: '🐻', label: 'Bear'   },
  { id: 'robot',  emoji: '🤖', label: 'Robot'  },
  { id: 'alien',  emoji: '👽', label: 'Alien'  },
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'ghost',  emoji: '👻', label: 'Ghost'  },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
]

export function getEmoji(avatarId: string): string {
  return AVATARS.find((a) => a.id === avatarId)?.emoji ?? '👤'
}
