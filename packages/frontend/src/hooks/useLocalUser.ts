import { useState } from 'react'

export interface LocalUser {
  userId: string
  name: string
  avatar: string
}

const STORAGE_KEY = 'scrum-poker:user'

function generateUserId(): string {
  return crypto.randomUUID()
}

function loadUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LocalUser>
    if (parsed.userId && parsed.name && parsed.avatar) {
      return parsed as LocalUser
    }
    return null
  } catch {
    return null
  }
}

function saveUser(user: LocalUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function useLocalUser() {
  const [user, setUserState] = useState<LocalUser | null>(() => loadUser())

  function setUser(name: string, avatar: string): LocalUser {
    const existing = loadUser()
    const userId = existing?.userId ?? generateUserId()
    const updated: LocalUser = { userId, name, avatar }
    saveUser(updated)
    setUserState(updated)
    return updated
  }

  function clearUser(): void {
    localStorage.removeItem(STORAGE_KEY)
    setUserState(null)
  }

  return { user, setUser, clearUser }
}
