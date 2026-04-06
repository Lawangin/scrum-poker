export interface AvatarDef {
  id: string
  emoji: string
  label: string
}

export const AVATARS: AvatarDef[] = [
  { id: 'ninja',     emoji: '🥷',  label: 'Ninja'     },
  { id: 'rocket',    emoji: '🚀',  label: 'Rocket'    },
  { id: 'fox',       emoji: '🦊',  label: 'Fox'       },
  { id: 'cat',       emoji: '🐱',  label: 'Cat'       },
  { id: 'bear',      emoji: '🐻',  label: 'Bear'      },
  { id: 'robot',     emoji: '🤖',  label: 'Robot'     },
  { id: 'alien',     emoji: '👽',  label: 'Alien'     },
  { id: 'wizard',    emoji: '🧙',  label: 'Wizard'    },
  { id: 'ghost',     emoji: '👻',  label: 'Ghost'     },
  { id: 'dragon',    emoji: '🐉',  label: 'Dragon'    },
  { id: 'wolf',      emoji: '🐺',  label: 'Wolf'      },
  { id: 'penguin',   emoji: '🐧',  label: 'Penguin'   },
  { id: 'panda',     emoji: '🐼',  label: 'Panda'     },
  { id: 'unicorn',   emoji: '🦄',  label: 'Unicorn'   },
  { id: 'shark',     emoji: '🦈',  label: 'Shark'     },
  { id: 'octopus',   emoji: '🐙',  label: 'Octopus'   },
  { id: 'parrot',    emoji: '🦜',  label: 'Parrot'    },
  { id: 'astronaut', emoji: '👨‍🚀', label: 'Astronaut' },
  { id: 'vampire',   emoji: '🧛',  label: 'Vampire'   },
  { id: 'zombie',    emoji: '🧟',  label: 'Zombie'    },
  { id: 'mage',      emoji: '🧝',  label: 'Mage'      },
  { id: 'pirate',    emoji: '🏴‍☠️', label: 'Pirate'    },
  { id: 'detective', emoji: '🕵️',  label: 'Detective' },
  { id: 'scientist', emoji: '🧪',  label: 'Scientist' },
  { id: 'phoenix',   emoji: '🔥',  label: 'Phoenix'   },
]

export function getEmoji(avatarId: string): string {
  return AVATARS.find((a) => a.id === avatarId)?.emoji ?? '👤'
}
