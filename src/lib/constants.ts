export const STORAGE_KEYS = {
  users: 'embedo-admin:mock:users',
  diagrams: 'embedo-admin:mock:diagrams',
  admins: 'embedo-admin:mock:admins',
  session: 'embedo-admin:mock:session',
  apiKeys: 'embedo-admin:mock:apiKeys',
  aiUsageDaily: 'embedo-admin:mock:aiUsageDaily',
  seeded: 'embedo-admin:mock:seeded',
} as const

export const ROUTES = {
  login: '/login',
  overview: '/',
  users: '/users',
  userDetailPattern: '/users/:id',
  userDetail: (id: string) => `/users/${id}`,
  diagrams: '/diagrams',
  diagramDetailPattern: '/diagrams/:id',
  diagramDetail: (id: string) => `/diagrams/${id}`,
  settings: '/settings',
} as const

export const SEED_ADMIN_EMAIL = 'admin@embedo.ai'
export const SEED_ADMIN_PASSWORD = 'Admin123!'
