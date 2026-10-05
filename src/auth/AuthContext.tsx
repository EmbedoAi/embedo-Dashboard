import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { adminApi } from '@/services/adminApi'
import type { AdminAccount } from '@/services/types'

interface AuthContextValue {
  admin: AdminAccount | null
  isLoadingAuth: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminAccount | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    let cancelled = false
    adminApi
      .getSession()
      .then((result) => {
        if (!cancelled) setAdmin(result?.admin ?? null)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAuth(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { admin: loggedInAdmin } = await adminApi.login(email, password)
    setAdmin(loggedInAdmin)
  }, [])

  const logout = useCallback(async () => {
    await adminApi.logout()
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
