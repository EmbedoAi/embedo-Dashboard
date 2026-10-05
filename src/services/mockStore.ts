import { STORAGE_KEYS } from '@/lib/constants'
import { generateAiUsageDaily, generateApiKeys, generateSeedAdmin, generateSeedUsersAndDiagrams } from './seedData'
import type { AdminSession, AdminUser, AiUsagePoint, ApiKeyUsage, Diagram } from './types'

interface StoredAdmin {
  id: string
  email: string
  name: string
  password: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // the app will just re-seed on next load.
  }
}

// Bump this whenever the shape of seeded data changes (new fields on
// AdminUser/Diagram/etc.) so existing localStorage from an older version of
// the app is regenerated instead of crashing pages that expect new fields.
const SEED_VERSION = 2

export function ensureSeeded(): void {
  if (readJson<number>(STORAGE_KEYS.seeded, 0) === SEED_VERSION) return

  const { users, diagrams } = generateSeedUsersAndDiagrams()
  const admin = generateSeedAdmin()

  writeJson(STORAGE_KEYS.users, users)
  writeJson(STORAGE_KEYS.diagrams, diagrams)
  writeJson(STORAGE_KEYS.admins, [admin])
  writeJson(STORAGE_KEYS.apiKeys, generateApiKeys())
  writeJson(STORAGE_KEYS.aiUsageDaily, generateAiUsageDaily())
  writeJson(STORAGE_KEYS.seeded, SEED_VERSION)
}

export function getUsers(): AdminUser[] {
  return readJson<AdminUser[]>(STORAGE_KEYS.users, [])
}

export function saveUsers(users: AdminUser[]): void {
  writeJson(STORAGE_KEYS.users, users)
}

export function getDiagrams(): Diagram[] {
  return readJson<Diagram[]>(STORAGE_KEYS.diagrams, [])
}

export function getAdmins(): StoredAdmin[] {
  return readJson<StoredAdmin[]>(STORAGE_KEYS.admins, [])
}

export function getApiKeys(): ApiKeyUsage[] {
  return readJson<ApiKeyUsage[]>(STORAGE_KEYS.apiKeys, [])
}

export function saveApiKeys(keys: ApiKeyUsage[]): void {
  writeJson(STORAGE_KEYS.apiKeys, keys)
}

export function getAiUsageDaily(): AiUsagePoint[] {
  return readJson<AiUsagePoint[]>(STORAGE_KEYS.aiUsageDaily, [])
}

export function getSession(): AdminSession | null {
  return readJson<AdminSession | null>(STORAGE_KEYS.session, null)
}

export function saveSession(session: AdminSession | null): void {
  if (session === null) {
    try {
      localStorage.removeItem(STORAGE_KEYS.session)
    } catch {
      // ignore
    }
    return
  }
  writeJson(STORAGE_KEYS.session, session)
}
