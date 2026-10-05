import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ROUTES } from '@/lib/constants'
import { DiagramDetailPage } from '@/pages/DiagramDetailPage'
import { DiagramsPage } from '@/pages/DiagramsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { UsersPage } from '@/pages/UsersPage'

const queryClient = new QueryClient()

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.overview} element={<OverviewPage />} />
              <Route path={ROUTES.users} element={<UsersPage />} />
              <Route path={ROUTES.userDetailPattern} element={<UserDetailPage />} />
              <Route path={ROUTES.diagrams} element={<DiagramsPage />} />
              <Route path={ROUTES.diagramDetailPattern} element={<DiagramDetailPage />} />
              <Route path={ROUTES.settings} element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
