import * as store from './mockStore'
import type {
  AdminAccount,
  AdminSession,
  AdminUser,
  AiUsageSummary,
  AnalyticsSummary,
  ApiKeyUsage,
  CreditUsagePoint,
  Diagram,
  ListDiagramsParams,
  ListUsersParams,
  Paginated,
  PlanTier,
  UserStatus,
} from './types'

function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeToken(): string {
  return `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

store.ensureSeeded()

export async function login(email: string, password: string): Promise<{ session: AdminSession; admin: AdminAccount }> {
  await delay()
  const admin = store.getAdmins().find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
  if (!admin || admin.password !== password) {
    throw new Error('Invalid email or password.')
  }
  const session: AdminSession = { token: makeToken(), adminId: admin.id }
  store.saveSession(session)
  return { session, admin: { id: admin.id, email: admin.email, name: admin.name } }
}

export async function logout(): Promise<void> {
  await delay(150)
  store.saveSession(null)
}

export async function getSession(): Promise<{ session: AdminSession; admin: AdminAccount } | null> {
  await delay(150)
  const session = store.getSession()
  if (!session) return null
  const admin = store.getAdmins().find((a) => a.id === session.adminId)
  if (!admin) {
    store.saveSession(null)
    return null
  }
  return { session, admin: { id: admin.id, email: admin.email, name: admin.name } }
}

export async function listUsers(params: ListUsersParams = {}): Promise<Paginated<AdminUser>> {
  await delay()
  const { search = '', status = 'all', page = 1, pageSize = 10 } = params
  const q = search.trim().toLowerCase()

  let filtered = store.getUsers()
  if (status !== 'all') {
    filtered = filtered.filter((u) => u.status === status)
  }
  if (q) {
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }
  filtered = [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  return { items, total }
}

export async function getUser(id: string): Promise<AdminUser> {
  await delay(200)
  const user = store.getUsers().find((u) => u.id === id)
  if (!user) throw new Error('User not found.')
  return user
}

// Deterministic per-user daily credit usage over the last 14 days, derived
// from the user's id so it's stable across reloads without needing its own
// storage — the numbers are scaled so they roughly sum to creditsUsed.
export async function getUserCreditHistory(id: string): Promise<CreditUsagePoint[]> {
  await delay(200)
  const user = store.getUsers().find((u) => u.id === id)
  if (!user) throw new Error('User not found.')

  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0
  const rand = (() => {
    let s = seed
    return () => {
      s = (s + 0x6d2b79f5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })()

  const days = 14
  const weights = Array.from({ length: days }, () => rand())
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1

  const points: CreditUsagePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const weight = weights[days - 1 - i]
    points.push({
      date: d.toISOString().slice(0, 10),
      creditsUsed: Math.round((weight / weightSum) * user.creditsUsed),
    })
  }
  return points
}

async function updateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
  await delay(250)
  const users = store.getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found.')
  users[idx] = { ...users[idx], status }
  store.saveUsers(users)
  return users[idx]
}

export async function approveUser(id: string): Promise<AdminUser> {
  return updateUserStatus(id, 'approved')
}

export async function suspendUser(id: string): Promise<AdminUser> {
  return updateUserStatus(id, 'suspended')
}

export async function reactivateUser(id: string): Promise<AdminUser> {
  return updateUserStatus(id, 'approved')
}

export async function listDiagrams(params: ListDiagramsParams = {}): Promise<Paginated<Diagram>> {
  await delay()
  const { search = '', ownerId, page = 1, pageSize = 10 } = params
  const q = search.trim().toLowerCase()

  let filtered = store.getDiagrams()
  if (ownerId) {
    filtered = filtered.filter((d) => d.ownerId === ownerId)
  }
  if (q) {
    filtered = filtered.filter(
      (d) => d.title.toLowerCase().includes(q) || d.ownerEmail.toLowerCase().includes(q),
    )
  }
  filtered = [...filtered].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  return { items, total }
}

export async function getDiagram(id: string): Promise<Diagram> {
  await delay(200)
  const diagram = store.getDiagrams().find((d) => d.id === id)
  if (!diagram) throw new Error('Diagram not found.')
  return diagram
}

function last7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await delay()
  const users = store.getUsers()
  const diagrams = store.getDiagrams()
  const days = last7Days()

  const newUsersLast7d = days.map((date) => ({
    date,
    count: users.filter((u) => u.createdAt.slice(0, 10) === date).length,
  }))
  const diagramsCreatedLast7d = days.map((date) => ({
    date,
    count: diagrams.filter((d) => d.createdAt.slice(0, 10) === date).length,
  }))

  const planCounts = new Map<PlanTier, number>([
    ['free', 0],
    ['pro', 0],
    ['team', 0],
  ])
  for (const u of users) {
    planCounts.set(u.plan, (planCounts.get(u.plan) ?? 0) + 1)
  }

  return {
    totalUsers: users.length,
    pendingUsers: users.filter((u) => u.status === 'pending').length,
    totalDiagrams: diagrams.length,
    totalCreditsUsed: users.reduce((sum, u) => sum + u.creditsUsed, 0),
    newUsersLast7d,
    diagramsCreatedLast7d,
    planBreakdown: Array.from(planCounts.entries()).map(([plan, count]) => ({ plan, count })),
  }
}

export async function listApiKeys(): Promise<ApiKeyUsage[]> {
  await delay(200)
  return [...store.getApiKeys()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function toggleApiKeyStatus(id: string): Promise<ApiKeyUsage> {
  await delay(250)
  const keys = store.getApiKeys()
  const idx = keys.findIndex((k) => k.id === id)
  if (idx === -1) throw new Error('API key not found.')
  keys[idx] = { ...keys[idx], status: keys[idx].status === 'active' ? 'revoked' : 'active' }
  store.saveApiKeys(keys)
  return keys[idx]
}

export async function getAiUsageSummary(): Promise<AiUsageSummary> {
  await delay(250)
  const keys = store.getApiKeys()
  const dailyUsage = store.getAiUsageDaily()

  const totalSpendUsd = Math.round(keys.reduce((sum, k) => sum + k.usedThisMonthUsd, 0) * 100) / 100
  const totalRequests = keys.reduce((sum, k) => sum + k.requestsThisMonth, 0)
  const activeKeys = keys.filter((k) => k.status === 'active').length

  return {
    totalSpendUsd,
    totalRequests,
    activeKeys,
    avgCostPerRequestUsd: totalRequests > 0 ? Math.round((totalSpendUsd / totalRequests) * 10000) / 10000 : 0,
    dailyUsage,
  }
}
