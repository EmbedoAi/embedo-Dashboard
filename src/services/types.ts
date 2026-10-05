export type UserStatus = 'pending' | 'approved' | 'suspended'
export type PlanTier = 'free' | 'pro' | 'team'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  status: UserStatus
  plan: PlanTier
  creditsUsed: number
  creditsLimit: number
  diagramCount: number
  createdAt: string
  lastActiveAt: string
}

export type DiagramMode = 'architect' | 'prototype'

export interface Diagram {
  id: string
  ownerId: string
  ownerEmail: string
  title: string
  tagline: string
  mode: DiagramMode
  controller: string
  nodeCount: number
  componentCount: number
  bomEstUnitCostUsd: number
  keyParts: string[]
  aiMessagesUsed: number
  createdAt: string
  updatedAt: string
}

export interface CreditUsagePoint {
  date: string
  creditsUsed: number
}

export interface DailyCount {
  date: string
  count: number
}

export interface PlanCount {
  plan: PlanTier
  count: number
}

export interface AnalyticsSummary {
  totalUsers: number
  pendingUsers: number
  totalDiagrams: number
  totalCreditsUsed: number
  newUsersLast7d: DailyCount[]
  diagramsCreatedLast7d: DailyCount[]
  planBreakdown: PlanCount[]
}

export type ApiProvider = 'openai' | 'anthropic'
export type ApiKeyStatus = 'active' | 'revoked'

export interface ApiKeyUsage {
  id: string
  provider: ApiProvider
  label: string
  maskedKey: string
  status: ApiKeyStatus
  monthlyLimitUsd: number
  usedThisMonthUsd: number
  requestsThisMonth: number
  tokensThisMonth: number
  createdAt: string
  lastUsedAt: string
}

export interface AiUsagePoint {
  date: string
  costUsd: number
  requests: number
}

export interface AiUsageSummary {
  totalSpendUsd: number
  totalRequests: number
  activeKeys: number
  avgCostPerRequestUsd: number
  dailyUsage: AiUsagePoint[]
}

export interface AdminAccount {
  id: string
  email: string
  name: string
}

export interface AdminSession {
  token: string
  adminId: string
}

export interface Paginated<T> {
  items: T[]
  total: number
}

export interface ListUsersParams {
  search?: string
  status?: UserStatus | 'all'
  page?: number
  pageSize?: number
}

export interface ListDiagramsParams {
  search?: string
  ownerId?: string
  page?: number
  pageSize?: number
}
