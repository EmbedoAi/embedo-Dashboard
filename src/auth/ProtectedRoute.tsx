import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/constants'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-embedo-logo border-t-transparent" />
      </div>
    )
  }

  if (!admin) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <>{children}</>
}
